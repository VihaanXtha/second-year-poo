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

        $result = $this->payments->initiate($order);

        return response()->json([
            'message' => 'Payment initiated.',
            'payment_id' => $payment->id,
            'data' => $result,
        ]);
    }

    public function callbackEsewa(Request $request)
    {
        $data = $request->only(['data', 'signature']);
        $success = $this->payments->verify('esewa', $data);

        $orderNumber = $this->extractOrderNumberFromEsewa($data['data'] ?? '');

        $this->resolvePayment($orderNumber, $success);

        return redirect()->away($success ? '/payment/success' : '/payment/failure');
    }

    public function callbackKhalti(Request $request)
    {
        $data = $request->only(['pidx', 'status', 'txnId', 'amount', 'mobile', 'purchase_order_id']);
        $success = $this->payments->verify('khalti', $data);

        $orderNumber = $data['purchase_order_id'] ?? '';

        $this->resolvePayment($orderNumber, $success);

        return redirect()->away($success ? '/payment/success' : '/payment/failure');
    }

    public function webhookStripe(Request $request)
    {
        $payload = $request->all();
        $success = $this->payments->verify('stripe', $payload);

        $paymentIntentId = $payload['id'] ?? '';
        $orderNumber = $payload['metadata']['order_number'] ?? '';

        $this->resolvePayment($orderNumber, $success, $paymentIntentId);

        return response()->json(['status' => $success ? 'ok' : 'failed']);
    }

    private function resolvePayment(string $orderNumber, bool $success, ?string $transactionId = null): void
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (! $order) {
            return;
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
    }

    private function extractOrderNumberFromEsewa(string $encodedData): string
    {
        $decoded = json_decode(base64_decode($encodedData), true);

        return is_array($decoded) ? ($decoded['transaction_uuid'] ?? '') : '';
    }
}
