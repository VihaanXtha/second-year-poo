<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusUpdated;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\VendorStore;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VendorController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary) {}

    public function registerStore(Request $request)
    {
        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'pan_number' => ['required', 'string', 'max:50', 'regex:/^[A-Z]{3}[0-9]{7}$|^[0-9]{8,10}$/'],
            'country' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'ward' => ['nullable', 'string', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
        ]);

        $data = $validated;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Logo must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Logo must not exceed 2MB.'], 422);
            }
            $data['logo'] = $this->uploadStoreImage($file);
        } elseif ($request->filled('logo_url')) {
            $data['logo'] = $request->input('logo_url');
        }

        if ($request->hasFile('banner')) {
            $file = $request->file('banner');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Banner must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Banner must not exceed 2MB.'], 422);
            }
            $data['banner'] = $this->uploadStoreImage($file);
        } elseif ($request->filled('banner_url')) {
            $data['banner'] = $request->input('banner_url');
        }

        $store = VendorStore::create(array_merge($data, [
            'user_id' => Auth::id(),
            'status' => 'pending',
        ]));

        $user = Auth::user();
        $user->update(['role' => 'vendor']);

        return response()->json(['message' => 'Store registered successfully.', 'store' => $store], 201);
    }

    public function updateStore(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $data = $validated;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Logo must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Logo must not exceed 2MB.'], 422);
            }
            $data['logo'] = $this->uploadStoreImage($file);
        } elseif ($request->filled('logo_url')) {
            $data['logo'] = $request->input('logo_url');
        }

        if ($request->hasFile('banner')) {
            $file = $request->file('banner');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Banner must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Banner must not exceed 2MB.'], 422);
            }
            $data['banner'] = $this->uploadStoreImage($file);
        } elseif ($request->filled('banner_url')) {
            $data['banner'] = $request->input('banner_url');
        }

        $store->update($data);

        return response()->json(['message' => 'Store updated.', 'store' => $store]);
    }

    public function myStore()
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
    }

    public function products(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $query = Product::where('vendor_store_id', $store->id)->with('category');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate(20);

        $products->getCollection()->transform(function ($product) {
            $product->category = $product->category?->name ?? $product->category;
            $product->category_id = $product->category_id ?? $product->category?->id;

            return $product;
        });

        return response()->json($products);
    }

    public function createProduct(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        if ($store->status !== 'active') {
            return response()->json(['message' => 'Your store is pending approval — you cannot manage products yet.'], 403);
        }

        $specsInput = $request->input('specs', []);
        if (is_string($specsInput)) {
            $decoded = json_decode($specsInput, true);
            $specsInput = is_array($decoded) ? $decoded : [];
            $request->merge(['specs' => $specsInput]);
        }

        $validated = $request->validate([
            'category' => ['required_without:category_id', 'string', 'max:255'],
            'category_id' => ['required_without:category', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:90'],
            'stock' => ['required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive,draft,out_of_stock'],
        ]);

        if (empty($validated['category_id'] ?? null) && ! empty($validated['category'] ?? null)) {
            $byName = Category::where('name', $validated['category'])->first();
            $bySlug = $byName ?: Category::where('slug', $validated['category'])->first();
            if ($bySlug) {
                $validated['category_id'] = $bySlug->id;
            } else {
                return response()->json(['message' => 'Category not found: '.$validated['category']], 422);
            }
        }

        if (empty($validated['sku'] ?? null)) {
            $validated['sku'] = 'SKU-'.strtoupper(substr(md5($validated['name'].microtime(true)), 0, 8));
        }
        unset($validated['category']);

        $category = Category::findOrFail($validated['category_id']);
        $specErrors = $this->validateSpecs($request->input('specs', []), $category->spec_schema);
        if ($specErrors) {
            $validator = validator(['specs' => $request->input('specs', [])], [
                'specs' => ['required', 'array'],
            ]);
            foreach ($specErrors as $key => $message) {
                $validator->after(function ($v) use ($key, $message) {
                    $v->errors()->add("specs.$key", $message);
                });
            }
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        }

        $validated['vendor_store_id'] = $store->id;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Image must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Image must not exceed 2MB.'], 422);
            }
            $validated['image'] = $this->uploadProductImage($file);
        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->input('image_url');
        } else {
            $validated['image'] = null;
        }

        $product = Product::create($validated);

        return response()->json(['message' => 'Product created.', 'product' => $product], 201);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        if ($store->status !== 'active') {
            return response()->json(['message' => 'Your store is pending approval — you cannot manage products yet.'], 403);
        }

        if ($product->vendor_store_id !== $store->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $specsInput = $request->input('specs', []);
        if (is_string($specsInput)) {
            $decoded = json_decode($specsInput, true);
            $specsInput = is_array($decoded) ? $decoded : [];
            $request->merge(['specs' => $specsInput]);
        }

        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'sku' => ['sometimes', 'nullable', 'string', 'max:100', 'unique:products,sku,'.$product->id],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'discount_percent' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:90'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['sometimes', 'required', 'in:active,inactive,draft,out_of_stock'],
        ]);

        if (empty($validated['category_id'] ?? null) && ! empty($validated['category'] ?? null)) {
            $byName = Category::where('name', $validated['category'])->first();
            $bySlug = $byName ?: Category::where('slug', $validated['category'])->first();
            if ($bySlug) {
                $validated['category_id'] = $bySlug->id;
            } else {
                return response()->json(['message' => 'Category not found: '.$validated['category']], 422);
            }
        }
        unset($validated['category']);

        $category = empty($validated['category_id'] ?? null)
            ? $product->category
            : Category::findOrFail($validated['category_id']);
        $specErrors = $this->validateSpecs($request->input('specs', []), $category->spec_schema);
        if ($specErrors) {
            $validator = validator(['specs' => $request->input('specs', [])], [
                'specs' => ['required', 'array'],
            ]);
            foreach ($specErrors as $key => $message) {
                $validator->after(function ($v) use ($key, $message) {
                    $v->errors()->add("specs.$key", $message);
                });
            }
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if (! in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Image must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Image must not exceed 2MB.'], 422);
            }
            $validated['image'] = $this->uploadProductImage($file);
        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->input('image_url');
        }

        $product->update($validated);

        if ($request->filled('category_id')) {
            OrderItem::where('product_id', $product->id)->update(['category_id' => $product->category_id]);
        }

        return response()->json(['message' => 'Product updated.', 'product' => $product]);
    }

    public function deleteProduct(Product $product)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        if ($product->vendor_store_id !== $store->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function updateProductImage(Request $request, Product $product)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        if ($store->status !== 'active') {
            return response()->json(['message' => 'Your store is pending approval — you cannot manage products yet.'], 403);
        }

        if ($product->vendor_store_id !== $store->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        $url = $this->uploadProductImage($request->file('image'));

        if (! $url) {
            return response()->json(['message' => 'Image upload failed.'], 422);
        }

        $product->update(['image' => $url]);

        return response()->json(['message' => 'Image updated.', 'image' => $url]);
    }

    private function uploadProductImage(UploadedFile $file): ?string
    {
        return $this->cloudinary->upload($file);
    }

    private function uploadStoreImage(UploadedFile $file): ?string
    {
        return $this->cloudinary->upload($file, 'circuit-bazaar/stores');
    }

    private function validateSpecs(array $specs, ?array $schema): array
    {
        $errors = [];
        $schemaKeys = [];
        $schemaFields = [];

        if (is_array($schema)) {
            foreach ($schema as $field) {
                $schemaKeys[] = $field['key'];
                $schemaFields[$field['key']] = $field;
            }
        }

        foreach ($specs as $key => $value) {
            if (! in_array($key, $schemaKeys, true)) {
                $errors[$key] = "Unknown spec field: $key.";

                continue;
            }

            $field = $schemaFields[$key];
            $type = $field['type'] ?? 'text';

            if ($type === 'number') {
                if (! is_numeric($value)) {
                    $errors[$key] = "{$field['label']} must be a number.";
                }
            } elseif ($type === 'select') {
                $options = $field['options'] ?? [];
                if (! in_array($value, $options, true)) {
                    $errors[$key] = "{$field['label']} must be one of: ".implode(', ', $options).'.';
                }
            } elseif ($type === 'boolean') {
                if (! is_bool($value)) {
                    $errors[$key] = "{$field['label']} must be true or false.";
                }
            } elseif ($type === 'text') {
                if (! is_string($value)) {
                    $errors[$key] = "{$field['label']} must be a string.";
                }
            }
        }

        return $errors;
    }

    public function orders(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $query = OrderItem::where('vendor_store_id', $store->id)
            ->with(['order.user', 'product'])
            ->select('order_id')
            ->distinct();

        if ($request->has('status')) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $orderIds = $query->pluck('order_id');
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

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $hasItem = OrderItem::where('order_id', $order->id)
            ->where('vendor_store_id', $store->id)
            ->exists();

        if (! $hasItem) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        event(new OrderStatusUpdated($order));

        return response()->json(['message' => 'Order status updated.', 'order' => $order]);
    }

    public function sales(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $period = $request->get('period', 'monthly');

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

        $query = OrderItem::where('vendor_store_id', $store->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid');

        if ($period === 'daily') {
            $sales = $query->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
            )->groupBy('date')->orderBy('date')->get();
        } else {
            $sales = $query->select(
                DB::raw('YEAR(orders.created_at) as year'),
                DB::raw('MONTH(orders.created_at) as month'),
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as orders')
            )->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get();
        }

        return response()->json(['sales' => $sales]);
    }

    public function reviews(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $reviews = Review::where('vendor_store_id', $store->id)
            ->with('user', 'product')
            ->latest()
            ->paginate(15);

        $reviews->getCollection()->transform(fn ($r) => [
            'id' => $r->id,
            'product_id' => $r->product_id,
            'product_name' => $r->product?->name,
            'customer_name' => $r->user?->name,
            'rating' => $r->rating,
            'comment' => $r->comment,
            'created_at' => $r->created_at,
        ]);

        return response()->json($reviews);
    }
}
