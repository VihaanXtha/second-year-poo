import pathlib
base = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers')

# ---------- 1) AuthController: enrich vendorLogin store payload + imports ----------
p = base / 'AuthController.php'
t = p.read_text(encoding='utf-8')
if 'use App\\Models\\OrderItem;' not in t:
    t = t.replace(
        "use App\\Models\\OtpCode;\nuse App\\Models\\User;",
        "use App\\Models\\OrderItem;\nuse App\\Models\\OtpCode;\nuse App\\Models\\Product;\nuse App\\Models\\Review;\nuse App\\Models\\User;",
        1,
    )

old_must = """                'store' => [
                    'id' => $store->id,
                    'store_name' => $store->store_name,
                    'verified' => (bool) $store->verified,
                    'status' => $store->status,
                ],
                'token' => $token,
            ]);
        }

        return response()->json([
            'message' => 'Vendor login successful.',"""
new_must = """                'store' => $this->vendorStorePayload($store),
                'token' => $token,
            ]);
        }

        return response()->json([
            'message' => 'Vendor login successful.',"""
assert old_must in t, 'must_change store block not found'
t = t.replace(old_must, new_must, 1)

old_final = """            'store' => [
                'id' => $store->id,
                'store_name' => $store->store_name,
                'verified' => (bool) $store->verified,
                'status' => $store->status,
            ],
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request)"""
new_final = """            'store' => $this->vendorStorePayload($store),
            'token' => $token,
        ]);
    }

    private function vendorStorePayload(VendorStore $store): array
    {
        $store->rating = (float) (Review::where('vendor_store_id', $store->id)->avg('rating') ?? 0);
        $store->total_products = Product::where('vendor_store_id', $store->id)->count();
        $store->total_orders = OrderItem::where('vendor_store_id', $store->id)->distinct('order_id')->count('order_id');
        $store->total_revenue = (float) (OrderItem::where('vendor_store_id', $store->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->sum('order_items.subtotal') ?? 0);

        return $store->toArray();
    }

    public function forgotPassword(Request $request)"""
assert old_final in t, 'final login block not found'
t = t.replace(old_final, new_final, 1)
p.write_text(t, encoding='utf-8')
print('AuthController patched')
