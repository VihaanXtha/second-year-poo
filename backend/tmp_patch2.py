import pathlib
base = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers')
p = base / 'VendorController.php'
t = p.read_text(encoding='utf-8')

if 'use Carbon\\Carbon;' not in t:
    t = t.replace(
        "use Illuminate\\Http\\UploadedFile;",
        "use Carbon\\Carbon;\nuse Illuminate\\Http\\UploadedFile;",
        1,
    )

# ---------- myStore: enrich ----------
old_my = """    public function myStore()
    {
        $store = VendorStore::where('user_id', Auth::id())->first();

        if (! $store) {
            return response()->json(['message' => 'No store found.'], 404);
        }

        return response()->json(['store' => $store]);
    }"""
new_my = """    public function myStore()
    {
        $store = VendorStore::where('user_id', Auth::id())->first();

        if (! $store) {
            return response()->json(['message' => 'No store found.'], 404);
        }

        $store->rating = (float) (Review::where('vendor_store_id', $store->id)->avg('rating') ?? 0);
        $store->total_products = Product::where('vendor_store_id', $store->id)->count();
        $store->total_orders = OrderItem::where('vendor_store_id', $store->id)->distinct('order_id')->count('order_id');
        $store->total_revenue = (float) (OrderItem::where('vendor_store_id', $store->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->sum('order_items.subtotal') ?? 0);

        return response()->json(['store' => $store]);
    }

    public function dashboardStats()
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $paidItems = OrderItem::where('vendor_store_id', $store->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid');

        $totalRevenue = (float) ((clone $paidItems)->sum('order_items.subtotal') ?? 0);
        $totalOrders = (clone $paidItems)->distinct()->count('order_items.order_id');
        $totalProducts = Product::where('vendor_store_id', $store->id)->count();
        $totalCustomers = (clone $paidItems)->distinct()->count('orders.user_id');

        return response()->json([
            'total_revenue' => $totalRevenue,
            'revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'orders' => $totalOrders,
            'total_products' => $totalProducts,
            'products' => $totalProducts,
            'total_customers' => $totalCustomers,
            'customers' => $totalCustomers,
            'revenue_change' => 0,
            'orders_change' => 0,
            'products_change' => 0,
            'customers_change' => 0,
        ]);
    }"""
assert old_my in t, 'myStore block not found'
t = t.replace(old_my, new_my, 1)

# ---------- products: category string mapping ----------
old_prod = """        $products = $query->latest()->paginate(20);

        return response()->json($products);"""
new_prod = """        $products = $query->latest()->paginate(20);

        $products->getCollection()->transform(function ($product) {
            $product->category = $product->category?->name ?? $product->category;
            $product->category_id = $product->category_id ?? $product->category?->id;

            return $product;
        });

        return response()->json($products);"""
assert old_prod in t, 'products block not found'
t = t.replace(old_prod, new_prod, 1)

p.write_text(t, encoding='utf-8')
print('VendorController part 1 patched')
