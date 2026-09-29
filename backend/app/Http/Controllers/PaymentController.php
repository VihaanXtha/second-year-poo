<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payments\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    public function initiate(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Payment already completed for this order.'], 422);
        }

        $validated = $request->validate([
            'method' => ['required', 'in:esewa,khalti,stripe,cod'],
        ]);

        $order->update(['payment_method' => $validated['method']]);

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'user_id' => Auth::id(),
                'method' => $validated['method'],
                'status' => 'pending',
                'amount' => $order->total,
                'payload' => [],
            ]
        );

        try {
            $result = $this->payments->initiate($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Khalti identifies the payment by pidx — persist it so the callback
        // can only settle the order it was issued for.
        if (isset($result['pidx']) && is_string($result['pidx']) && $result['pidx'] !== '') {
            $payment->update(['payload' => ['pidx' => $result['pidx']]]);
        }

        return response()->json([
            'message' => 'Payment initiated.',
            'payment_id' => $payment->id,
            'data' => $result,
        ]);
    }

    /**
     * eSewa redirects the browser here (GET with ?data=… on success, bare
     * ?status=failure on cancel). Verify, resolve, then land on the shop's
     * order-confirmed page — never on the API host.
     */
    public function callbackEsewa(Request $request)
    {
        $data = $request->only(['data', 'signature']);
        $success = $this->payments->verify('esewa', $data);

        $orderNumber = (string) $request->query('order_number', '');
        if ($orderNumber === '' && isset($data['data'])) {
            $orderNumber = $this->extractOrderNumberFromEsewa($data['data']);
        }

        $order = $this->resolvePayment($orderNumber, $success);

        return redirect()->away($this->confirmedUrl($order, $success));
    }

    /**
     * Khalti redirects the browser here (GET with ?pidx=…&purchase_order_id=…
     * on completion or cancel). Verify via lookup, resolve, then land on the
     * shop's order-confirmed page — never on the API host.
     *
     * Per https://docs.khalti.com/khalti-epayment/#payment-status-code:
     * Completed → settle; Pending/Initiated → keep the order unpaid (the
     * customer can retry from the shop); everything else (Expired,
     * User canceled, Refunded, lookup failure) → cancel + restock.
     */
    public function callbackKhalti(Request $request)
    {
        $data = $request->only(['pidx', 'status', 'txnId', 'tidx', 'transaction_id', 'amount', 'total_amount', 'mobile', 'purchase_order_id', 'purchase_order_name']);
        $gateway = $this->payments->gateway('khalti');
        $khaltiStatus = $gateway instanceof \App\Services\Payments\KhaltiGateway
            ? $gateway->status($data)
            : ($this->payments->verify('khalti', $data) ? 'Completed' : null);

        $orderNumber = (string) ($data['purchase_order_id'] ?? '');
        $order = $orderNumber !== ''
            ? Order::where('order_number', $orderNumber)->first()
            : null;

        // Bind the callback to the initiated payment: the pidx must match the
        // one stored at initiate time, so one order can't be settled with
        // another order's receipt.
        $storedPidx = null;
        $latest = $order?->payments()->latest()->first();
        if (is_array($latest?->payload)) {
            $storedPidx = $latest->payload['pidx'] ?? null;
        }

        $hold = in_array($khaltiStatus, ['Pending', 'Initiated'], true);
        $success = $khaltiStatus === 'Completed';
        if ($storedPidx && ($data['pidx'] ?? null) !== $storedPidx) {
            $hold = false;
            $success = false;
        }

        // Always keep the raw callback + lookup status on the payment for
        // debugging (without wiping the stored pidx binding above).
        if ($latest) {
            $latest->update([
                'payload' => array_merge(
                    is_array($latest->payload) ? $latest->payload : [],
                    ['callback' => $data, 'khalti_status' => $khaltiStatus]
                ),
            ]);
        }

        $transactionId = $data['transaction_id'] ?? $data['tidx'] ?? $data['txnId'] ?? null;

        if ($hold) {
            return redirect()->away($this->confirmedUrl($order, true));
        }

        $order = $this->resolvePayment($orderNumber, $success, $transactionId);

        return redirect()->away($this->confirmedUrl($order, $success));
    }

    public function webhookStripe(Request $request)
    {
        $payload = $request->all();
        $object = $payload['data']['object'] ?? [];
        $orderNumber = (string) ($object['metadata']['order_number'] ?? '');

        $success = $this->payments->verify('stripe', [
            'id' => $object['id'] ?? '',
            'order_number' => $orderNumber,
        ]);

        $this->resolvePayment($orderNumber, $success, $object['id'] ?? null);

        return response()->json(['status' => $success ? 'ok' : 'failed']);
    }

    /**
     * Browser return from Stripe Checkout: verify the session server-side and
     * mark the order paid/failed. Called by the shop's /payment/stripe/return
     * page while the customer is still authenticated.
     */
    public function verifyStripe(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'session_id' => ['required', 'string', 'max:255'],
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['success' => true, 'payment_status' => 'paid', 'status' => $order->status]);
        }

        $success = $this->payments->verify('stripe', [
            'session_id' => $validated['session_id'],
            'order_number' => $order->order_number,
        ]);

        $this->resolvePayment($order->order_number, $success, $validated['session_id']);

        $order->refresh();

        return response()->json([
            'success' => $success,
            'payment_status' => $order->payment_status,
            'status' => $order->status,
        ]);
    }

    private function resolvePayment(string $orderNumber, bool $success, ?string $transactionId = null): ?Order
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            return null;
        }

        DB::transaction(function () use ($order, $success, $transactionId) {
            $payment = $order->payments()->latest()->first();

            if (! $payment) {
                return;
            }

            if ($success) {
                $payment->update([
                    'status' => 'paid',
                    'transaction_id' => $transactionId ?? $order->order_number,
                ]);

                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'transaction_id' => $transactionId,
                ]);

                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled',
                ]);

                foreach ($order->items as $item) {
                    $product = $item->product;
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                    }
                }
            }
        });

        return $order;
    }

    /** Absolute URL on the shop origin for the order-confirmed page. */
    private function confirmedUrl(?Order $order, bool $success): string
    {
        $shop = rtrim((string) config('services.shop.url', 'http://localhost:3003'), '/');

        $query = [];
        if ($order) {
            $query['order'] = (string) $order->id;
        }
        if (! $success) {
            $query['payment'] = 'failed';
        }

        return $shop.'/order/confirmed'.($query ? '?'.http_build_query($query) : '');
    }

    private function extractOrderNumberFromEsewa(string $encodedData): string
    {
        $decoded = json_decode(base64_decode($encodedData), true);

        return is_array($decoded) ? ($decoded['transaction_uuid'] ?? '') : '';
    }
}