<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\VendorStore;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function vendors(Request $request)
    {
        $query = VendorStore::query()->with('user');

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
}
