<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Order::where('user_id', $user->id)->with('items.product');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(15);

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        $order->load('items.product', 'payments');

        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['order' => $order]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'payment_method' => ['required', 'in:esewa,khalti,cod'],
        ]);

        $total = 0;
        $orderItems = [];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);

            if ($product->stock < $item['quantity']) {
                return response()->json(['message' => "Insufficient stock for {$product->name}."], 422);
            }

            $subtotal = $product->price * $item['quantity'];
            $total += $subtotal;

            $orderItems[] = [
                'product_id' => $product->id,
                'vendor_store_id' => $product->vendor_store_id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'unit_price' => $product->price,
                'quantity' => $item['quantity'],
                'subtotal' => $subtotal,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::transaction(function () use ($validated, $total, $orderItems, &$order) {
            $order = Order::create([
                'user_id' => Auth::id(),
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'pending',
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_phone' => $validated['shipping_phone'],
            ]);

            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);

                $product = Product::find($item['product_id']);
                $product->decrement('stock', $item['quantity']);
            }

            Payment::create([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'method' => $validated['payment_method'],
                'status' => 'pending',
                'amount' => $total,
            ]);
        });

        $order->load('items.product');

        return response()->json(['message' => 'Order placed successfully.', 'order' => $order], 201);
    }
}
