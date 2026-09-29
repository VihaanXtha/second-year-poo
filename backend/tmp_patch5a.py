import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers\VendorController.php')
t = p.read_text(encoding='utf-8')

old_orders = """        $orderIds = $query->pluck('order_id');
        $orders = Order::whereIn('id', $orderIds)->with('user')->latest()->paginate(20);

        return response()->json($orders);"""
new_orders = """        $orderIds = $query->pluck('order_id');
        $limit = (int) $request->get('limit', 20);
        $limit = max(1, min($limit, 100));
        $orders = Order::whereIn('id', $orderIds)->with('user')->latest()->paginate($limit);

        $orders->getCollection()->transform(function ($order) use ($store) {
            $items = OrderItem::where('order_id', $order->id)
                ->where('vendor_store_id', $store->id)
                ->get();
            $subtotal = (float) $items->sum('subtotal');

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->user?->name,
                'customer_email' => $order->user?->email,
                'total' => $order->total,
                'subtotal' => $subtotal,
                'status' => $order->status,
                'items_count' => $items->count(),
                'created_at' => $order->created_at,
                'shipping_address' => $order->shipping_address,
                'items' => $items->map(fn ($it) => [
                    'id' => $it->id,
                    'product_id' => $it->product_id,
                    'product_name' => $it->product_name,
                    'quantity' => $it->quantity,
                    'price' => $it->unit_price,
                    'unit_price' => $it->unit_price,
                    'subtotal' => $it->subtotal,
                ])->values(),
            ];
        });

        return response()->json($orders);"""
assert old_orders in t, 'orders block not found'
t = t.replace(old_orders, new_orders, 1)
p.write_text(t, encoding='utf-8')
print('orders patched')
