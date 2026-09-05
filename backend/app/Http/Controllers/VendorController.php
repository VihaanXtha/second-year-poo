<?php

namespace App\Http\Controllers;

use App\Models\VendorStore;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Events\OrderStatusUpdated;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
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
        ]);

        $store = VendorStore::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status' => 'pending',
        ]));

        $user = Auth::user();
        $user->update(['role' => 'vendor']);

        return response()->json(['message' => 'Store registered successfully.', 'store' => $store], 201);
    }

    public function myStore()
    {
        $store = VendorStore::where('user_id', Auth::id())->first();

        if (!$store) {
            return response()->json(['message' => 'No store found.'], 404);
        }

        return response()->json(['store' => $store]);
    }

    public function products(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $query = Product::where('vendor_store_id', $store->id)->with('category');

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    public function createProduct(Request $request)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        if ($store->status !== 'active') {
            return response()->json(['message' => 'Your store is pending approval — you cannot manage products yet.'], 403);
        }

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive,draft'],
        ]);

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
            if (!in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Image must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Image must not exceed 2MB.'], 422);
            }
            $validated['image'] = $this->uploadProductImage($file);
        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
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

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku,' . $product->id],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive,draft'],
        ]);

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

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if (!in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'webp'])) {
                return response()->json(['message' => 'Image must be jpeg, png, or webp.'], 422);
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                return response()->json(['message' => 'Image must not exceed 2MB.'], 422);
            }
            $validated['image'] = $this->uploadProductImage($file);
        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
        } else {
            $validated['image'] = $product->image;
        }

        $product->update($validated);

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

        if (!$url) {
            return response()->json(['message' => 'Image upload failed.'], 422);
        }

        $product->update(['image' => $url]);

        return response()->json(['message' => 'Image updated.', 'image' => $url]);
    }

    private function uploadProductImage(UploadedFile $file): ?string
    {
        return $this->cloudinary->upload($file);
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
            if (!in_array($key, $schemaKeys, true)) {
                $errors[$key] = "Unknown spec field: $key.";
                continue;
            }

            $field = $schemaFields[$key];
            $type = $field['type'] ?? 'text';

            if ($type === 'number') {
                if (!is_numeric($value)) {
                    $errors[$key] = "{$field['label']} must be a number.";
                }
            } elseif ($type === 'select') {
                $options = $field['options'] ?? [];
                if (!in_array($value, $options, true)) {
                    $errors[$key] = "{$field['label']} must be one of: " . implode(', ', $options) . ".";
                }
            } elseif ($type === 'boolean') {
                if (!is_bool($value)) {
                    $errors[$key] = "{$field['label']} must be true or false.";
                }
            } elseif ($type === 'text') {
                if (!is_string($value)) {
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
        $orders = Order::whereIn('id', $orderIds)->with('user')->latest()->paginate(20);

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $store = VendorStore::where('user_id', Auth::id())->firstOrFail();

        $hasItem = OrderItem::where('order_id', $order->id)
            ->where('vendor_store_id', $store->id)
            ->exists();

        if (!$hasItem) {
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

        return response()->json($reviews);
    }
}
