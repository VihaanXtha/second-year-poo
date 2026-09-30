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
use Illuminate\Validation\Rule;

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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // `role=all` (or no role param) returns every account, so Google, phone
        // and email sign-ups all show up on the admin screens.
        $role = $request->get('role');
        if ($role && $role !== 'all') {
            $validated = $request->validate(['role' => 'in:customer,vendor,admin']);
            $query->where('role', $validated['role']);
        }

        $perPage = (int) $request->get('per_page', 15);
        $perPage = max(1, min($perPage, 200));

        $users = $query->latest()->paginate($perPage);

        // Other personas (vendor/admin) that share the same email — the email
        // is the key linking a person's accounts across the role "spaces".
        $emails = $users->getCollection()->pluck('email')->filter()->unique()->values();
        $personasByEmail = $emails->isEmpty()
            ? collect()
            : User::whereIn('email', $emails)->get(['id', 'email', 'role'])->groupBy('email');

        // Return full user details (password is hidden by the model's Hidden attribute)
        $users->getCollection()->transform(function ($user) use ($personasByEmail) {
            $user->makeVisible(['address', 'city', 'postal_code', 'country', 'phone', 'phone_verified_at', 'email_verified_at', 'created_at', 'updated_at']);

            // Tell the admin portal how this account signed up so Google and
            // phone customers are visible and distinguishable from email ones.
            $user->auth_provider = $user->google_id
                ? 'google'
                : ($user->email ? 'email' : 'phone');

            // The same person's accounts in the other roles (if any).
            $user->linked_accounts = ($user->email ? ($personasByEmail[$user->email] ?? collect()) : collect())
                ->where('id', '!=', $user->id)
                ->map(fn ($persona) => ['id' => $persona->id, 'role' => $persona->role])
                ->values();

            return $user;
        });

        return response()->json($users);
    }

    public function updateUserStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,banned',
        ]);

        // Never let the panel lock itself out: the last active admin must stay active.
        if ($validated['status'] !== 'active' && $this->isLastActiveAdmin($user)) {
            return response()->json(['message' => 'This is the last active admin. At least one admin must stay active.'], 422);
        }

        $user->update(['status' => $validated['status']]);

        return response()->json(['message' => 'User status updated.', 'user' => $user]);
    }

    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->where('role', 'admin')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'status' => ['nullable', 'in:active,inactive,banned'],
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'status' => $validated['status'] ?? 'active',
            // Admin accounts are created by other admins, not via the customer
            // OTP flows — mark them verified so the new admin can actually sign in.
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        return response()->json(['message' => 'Admin created.', 'admin' => $admin], 201);
    }

    public function deleteUser(Request $request, User $user)
    {
        // At least one admin account must be kept — the last admin can never
        // be deleted.
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['message' => 'At least one admin account must be kept. This admin cannot be deleted.'], 422);
        }

        // Deleting the account you are signed in with would kill the current
        // session mid-use.
        if ($request->user() && $user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete the account you are signed in with.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    public function vendors(Request $request)
    {
        $query = VendorStore::query()
            // Skip orphan stores whose user was removed outside the FK cascade.
            ->whereHas('user')
            ->where(function ($q) {
                $q->where('verified', true)
                    ->orWhere('status', 'active');
            })
            ->with('user')
            ->withCount('products')
            ->withSum('orderItems', 'subtotal');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('store_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $validated = $request->validate(['status' => 'in:active,suspended,inactive']);
            $query->where('status', $validated['status']);
        }

        $perPage = (int) $request->get('per_page', 15);
        $perPage = max(1, min($perPage, 200));

        $vendors = $query->latest()->paginate($perPage);

        $vendors->getCollection()->transform(function ($store) {
            return [
                'id' => $store->user->id,
                'store_id' => $store->id,
                'name' => $store->user->name,
                'email' => $store->user->email,
                'role' => $store->user->role,
                'status' => $store->status,
                'created_at' => $store->user->created_at,
                'store_name' => $store->store_name,
                'products_count' => $store->products_count,
                'total_sales' => (float) ($store->order_items_sum_subtotal ?? 0),
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

        // The admin "Vendor Applications" box is for pending work: default to
        // pending so approved/rejected applications don't show up again.
        // Pass ?status=all to see the full history (tabs in the portal).
        $status = $request->get('status', 'pending');
        if ($status !== 'all') {
            $validated = $request->validate(['status' => 'in:pending,verified,approved,rejected']);
            // $validated is empty when the param was absent and the default
            // kicked in, so filter on the resolved value, not the validated one.
            $query->where('status', $validated['status'] ?? $status);
        }

        $perPage = (int) $request->get('per_page', 15);
        $perPage = max(1, min($perPage, 200));

        $applications = $query->latest()->paginate($perPage);

        $applications->getCollection()->transform(function ($app) {
            return [
                'id' => $app->id,
                'user_id' => $app->id,
                'full_name' => $app->full_name,
                'store_name' => $app->store_name,
                'description' => $app->description,
                'website' => $app->website,
                'pan_number' => $app->pan_number,
                'country' => $app->country,
                'province' => $app->province,
                'district' => $app->district,
                'municipality' => $app->municipality,
                'ward' => $app->ward,
                'postal_code' => $app->postal_code,
                'address' => $app->address,
                'phone' => $app->phone,
                'status' => $app->status,
                'verified' => $app->status === 'approved',
                'otp_verified_at' => $app->otp_verified_at,
                'phone_otp_verified_at' => $app->phone_otp_verified_at,
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

        $counts = VendorApplication::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $payload = $applications->toArray();
        $payload['counts'] = [
            'pending' => (int) ($counts['pending'] ?? 0),
            'verified' => (int) ($counts['verified'] ?? 0),
            'approved' => (int) ($counts['approved'] ?? 0),
            'rejected' => (int) ($counts['rejected'] ?? 0),
        ];

        return response()->json($payload);
    }

    public function newVendorApplications(Request $request)
    {
        // Only applications still awaiting a decision count as "new".
        $query = VendorApplication::query()->where('status', 'pending');

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
        if ($vendorApplication->status === 'approved') {
            return response()->json(['message' => 'This application has already been approved.'], 422);
        }

        // Only a *vendor* account blocks approval. The same person may already
        // hold a customer or admin persona on this email — approval then
        // creates the vendor persona alongside it.
        if (User::where('role', 'vendor')->where('email', $vendorApplication->email)->exists()) {
            return response()->json(['message' => 'A vendor account with this email already exists. Remove the duplicate vendor account or update the application first.'], 422);
        }

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
        if ($vendorApplication->status === 'approved') {
            return response()->json(['message' => 'An approved application cannot be rejected.'], 422);
        }

        $vendorApplication->update(['status' => 'rejected']);

        return response()->json(['message' => 'Vendor application rejected.', 'vendor' => $vendorApplication]);
    }

    public function updateVendorApplication(Request $request, VendorApplication $vendorApplication)
    {
        if (in_array($vendorApplication->status, ['approved', 'rejected'], true)) {
            return response()->json(['message' => 'Only pending or verified applications can be edited.'], 422);
        }

        $validated = $request->validate([
            'store_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $vendorApplication->update($validated);

        return response()->json(['message' => 'Application updated.', 'application' => $vendorApplication]);
    }

    public function products(Request $request)
    {
        $query = Product::query()->with(['vendorStore', 'category']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('vendor_store_id')) {
            $query->where('vendor_store_id', $request->vendor_store_id);
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    public function toggleFeatured(Product $product)
    {
        $product->update(['featured' => ! $product->featured]);

        return response()->json(['message' => 'Featured flag updated.', 'featured' => $product->featured]);
    }

    public function setProductDiscount(Request $request, Product $product)
    {
        $validated = $request->validate([
            'discount_percent' => ['required', 'numeric', 'min:0', 'max:90'],
        ]);

        $product->update($validated);

        return response()->json(['message' => 'Discount updated.', 'product' => $product]);
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
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
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
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active', 'spec_schema']);

        return response()->json(['categories' => $categories]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->where('role', $user->role)->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->where('role', $user->role)->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'status' => ['nullable', 'in:active,inactive,banned'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'ward' => ['nullable', 'string', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        // The last active admin must stay active — the panel must never lock itself out.
        if (isset($validated['status']) && $validated['status'] !== 'active' && $this->isLastActiveAdmin($user)) {
            return response()->json(['message' => 'This is the last active admin. At least one admin must stay active.'], 422);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        if (isset($validated['status'])) {
            $user->status = $validated['status'];
        }
        foreach (['phone', 'address', 'city', 'province', 'district', 'municipality', 'ward', 'postal_code', 'country'] as $field) {
            if (array_key_exists($field, $validated)) {
                $user->{$field} = $validated[$field];
            }
        }
        $user->save();

        return response()->json(['message' => 'User updated.', 'user' => $user]);
    }

    /**
     * True when this user is the only remaining active admin account — such an
     * account may never be deleted, deactivated or banned.
     */
    private function isLastActiveAdmin(User $user): bool
    {
        return $user->role === 'admin'
            && $user->status === 'active'
            && User::where('role', 'admin')->where('status', 'active')->count() <= 1;
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
