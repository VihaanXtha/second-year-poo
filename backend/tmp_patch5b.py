import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers\VendorController.php')
t = p.read_text(encoding='utf-8')

old_head = """        $period = $request->get('period', 'monthly');

        $query = OrderItem::where('vendor_store_id', $store->id)"""
new_head = """        $period = $request->get('period', 'monthly');

        if ($request->filled('days')) {
            $days = max(1, min((int) $request->get('days'), 365));
            $start = Carbon::now()->subDays($days - 1)->startOfDay();

            $rows = OrderItem::where('vendor_store_id', $store->id)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.payment_status', 'paid')
                ->where('orders.created_at', '>=', $start)
                ->select(
                    DB::raw('DATE(orders.created_at) as date'),
                    DB::raw('SUM(order_items.subtotal) as revenue'),
                    DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
                )->groupBy('date')->orderBy('date')->get()
                ->keyBy('date');

            $byDay = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $d = Carbon::now()->subDays($i)->toDateString();
                $row = $rows->get($d);
                $byDay[] = [
                    'date' => $d,
                    'revenue' => (float) ($row->revenue ?? 0),
                    'orders' => (int) ($row->orders ?? 0),
                ];
            }

            $totalRevenue = array_sum(array_column($byDay, 'revenue'));
            $totalOrders = array_sum(array_column($byDay, 'orders'));

            $byCategory = OrderItem::where('order_items.vendor_store_id', $store->id)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
                ->where('orders.payment_status', 'paid')
                ->where('orders.created_at', '>=', $start)
                ->select(
                    DB::raw("COALESCE(categories.name, 'Uncategorized') as name"),
                    DB::raw('SUM(order_items.subtotal) as value')
                )->groupBy('name')->orderByDesc('value')->get();

            $topProducts = OrderItem::where('order_items.vendor_store_id', $store->id)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.payment_status', 'paid')
                ->where('orders.created_at', '>=', $start)
                ->select(
                    'order_items.product_id as id',
                    DB::raw('MAX(order_items.product_name) as name'),
                    DB::raw('SUM(order_items.quantity) as sold'),
                    DB::raw('SUM(order_items.quantity) as quantity'),
                    DB::raw('SUM(order_items.subtotal) as revenue'),
                    DB::raw('SUM(order_items.subtotal) as total')
                )->groupBy('order_items.product_id')->orderByDesc('revenue')->limit(10)->get();

            return response()->json([
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => (int) $totalOrders,
                'average_order_value' => $totalOrders ? (float) $totalRevenue / $totalOrders : 0,
                'by_day' => $byDay,
                'by_category' => $byCategory,
                'top_products' => $topProducts,
                'sales' => $byDay,
            ]);
        }

        $query = OrderItem::where('vendor_store_id', $store->id)"""
assert old_head in t, 'sales head not found'
t = t.replace(old_head, new_head, 1)
p.write_text(t, encoding='utf-8')
print('sales patched')
