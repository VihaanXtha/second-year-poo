<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusUpdated;
use App\Mail\VendorCredentialsMail;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorApplication;
use App\Models\VendorStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers = User::count();
        $totalVendors = User::where('role', 'vendor')->count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');

        $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'role', 'status', 'created_at']);
        $recentOrders = Order::latest()->take(5)->with('user')->get(['id', 'order_number', 'status', 'total', 'created_at', 'user_id']);

        return response()->json([
            'total_users' => $totalUsers,
            'total_vendors' => $totalVendors,
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_revenue' => (float) $totalRevenue,
            'recent_users' => $recentUsers,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(15);

        // Return full user details (password is hidden by the model's Hidden attribute)
        $users->getCollection()->transform(function ($user) {
            $user->makeVisible(['address', 'city', 'postal_code', 'country', 'phone', 'phone_verified_at', 'email_verified_at', 'created_at', 'updated_at']);

            return $user;
        });

        return response()->json($users);
    }

    public function updateUserStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,banned',
        ]);

        $user->update(['status' => $validated['status']]);

        return response()->json(['message' => 'User status updated.', 'user' => $user]);
    }

    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'status' => ['nullable', 'in:active,inactive,banned'],
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json(['message' => 'Admin created.', 'admin' => $admin], 201);
    }

    public function deleteUser(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    public function vendors(Request $request)
    {
        $query = VendorStore::query()
            ->where('verified', true)
            ->orWhere('status', 'active')
            ->with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('store_name', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $vendors = $query->latest()->paginate(15);

        $vendors->getCollection()->transform(function ($store) {
            return [
                'id' => $store->user->id,
                'name' => $store->user->name,
                'email' => $store->user->email,
                'role' => $store->user->role,
                'status' => $store->status,
                'created_at' => $store->user->created_at,
                'store_name' => $store->store_name,
                'products_count' => 0,
                'total_sales' => 0,
                'description' => $store->description,
                'address' => $store->address,
                'phone' => $store->phone,
                'pan_number' => $store->pan_number,
                'country' => $store->country,
                'province' => $store->province,
                'district' => $store->district,
                'municipality' => $store->municipality,
                'ward' => $store->ward,
                'postal_code' => $store->postal_code,
                'user_phone' => $store->user->phone,
                'user_address' => $store->user->address,
                'user_city' => $store->user->city,
                'user_province' => $store->user->province,
                'user_district' => $store->user->district,
                'user_municipality' => $store->user->municipality,
                'user_ward' => $store->user->ward,
                'user_postal_code' => $store->user->postal_code,
                'user_country' => $store->user->country,
            ];
        });

        return response()->json($vendors);
    }

    public function verifyVendor(VendorStore $vendorStore)
    {
        $vendorStore->update(['verified' => true, 'status' => 'active']);

        return response()->json(['message' => 'Vendor verified.', 'vendor' => $vendorStore]);
    }

    public function suspendVendor(VendorStore $vendorStore)
    {
        $vendorStore->update(['status' => 'suspended']);

        return response()->json(['message' => 'Vendor suspended.', 'vendor' => $vendorStore]);
    }

    public function vendorApplications(Request $request)
    {
        $query = VendorApplication::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('store_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->latest()->paginate(15);

        $applications->getCollection()->transform(function ($app) {
            return [
                'id' => $app->id,
                'user_id' => $app->id,
                'store_name' => $app->store_name,
                'description' => $app->description,
                'address' => $app->address,
                'phone' => $app->phone,
                'status' => $app->status,
                'verified' => $app->status === 'approved',
                'created_at' => $app->created_at,
                'user' => [
                    'id' => $app->id,
                    'name' => $app->full_name,
                    'email' => $app->email,
                    'role' => 'vendor',
                    'email_verified_at' => $app->otp_verified_at,
                ],
            ];
        });

        return response()->json($applications);
    }

    public function newVendorApplications(Request $request)
    {
        $query = VendorApplication::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('store_name', 'like', "%{$search}%");
            });
        }

        $applications = $query->latest()->paginate(15);

        return response()->json($applications);
    }

    public function approveVendor(VendorApplication $vendorApplication)
    {
        DB::beginTransaction();

        try {
            $tempPassword = bin2hex(random_bytes(16));

            $user = User::create([
                'name' => $vendorApplication->full_name,
                'email' => $vendorApplication->email,
                'password' => Hash::make($tempPassword),
                'role' => 'vendor',
                'status' => 'active',
                'phone' => $vendorApplication->phone,
                'address' => $vendorApplication->address,
                'city' => $vendorApplication->municipality,
                'province' => $vendorApplication->province,
                'district' => $vendorApplication->district,
                'municipality' => $vendorApplication->municipality,
                'ward' => $vendorApplication->ward,
                'postal_code' => $vendorApplication->postal_code,
                'country' => $vendorApplication->country,
                'must_change_password' => true,
            ]);

            VendorStore::create([
                'user_id' => $user->id,
                'store_name' => $vendorApplication->store_name,
                'description' => $vendorApplication->description,
                'address' => $vendorApplication->address,
                'phone' => $vendorApplication->phone,
                'status' => 'active',
                'verified' => true,
            ]);

            $portalUrl = env('VENDOR_PORTAL_URL');

            Mail::to($user->email)->send(new VendorCredentialsMail($user->email, $tempPassword, $portalUrl));

            $vendorApplication->update(['status' => 'approved']);

            DB::commit();

            return response()->json([
                'message' => 'Vendor approved and account created. Credentials email sent.',
                'vendor' => $vendorApplication,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json(['message' => 'Failed to approve vendor: '.$e->getMessage()], 500);
        }
    }

    public function rejectVendor(VendorApplication $vendorApplication)
    {
        $vendorApplication->update(['status' => 'rejected']);

        return response()->json(['message' => 'Vendor application rejected.', 'vendor' => $vendorApplication]);
    }

    public function products(Request $request)
    {
        $query = Product::query()->with(['vendorStore', 'category']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    public function deleteProduct(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function orders(Request $request)
    {
        $query = Order::query()->with('user', 'items.product');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $orders = $query->latest()->paginate(20);

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        event(new OrderStatusUpdated($order));

        return response()->json(['message' => 'Order status updated.', 'order' => $order]);
    }

    public function salesReport(Request $request)
    {
        $period = $request->get('period', 'monthly');

        $query = Order::where('payment_status', 'paid');

        if ($period === 'daily') {
            $sales = $query->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )->groupBy('date')->orderBy('date')->get();
        } else {
            $sales = $query->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get();
        }

        return response()->json(['sales' => $sales]);
    }

    public function categories()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug', 'spec_schema']);

        return response()->json(['categories' => $categories]);
    }

    public function updateCategorySpecSchema(Request $request, Category $category)
    {
        $validated = $request->validate([
            'spec_schema' => ['nullable', 'array'],
        ]);

        $category->update([
            'spec_schema' => $validated['spec_schema'] ?? [],
        ]);

        return response()->json(['message' => 'Category updated.', 'category' => $category]);
    }
}
