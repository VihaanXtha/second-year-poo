import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers\VendorController.php')
t = p.read_text(encoding='utf-8')

old_rev = """        $reviews = Review::where('vendor_store_id', $store->id)
            ->with('user', 'product')
            ->latest()
            ->paginate(15);

        return response()->json($reviews);"""
new_rev = """        $reviews = Review::where('vendor_store_id', $store->id)
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

        return response()->json($reviews);"""
assert old_rev in t, 'reviews block not found'
t = t.replace(old_rev, new_rev, 1)
p.write_text(t, encoding='utf-8')
print('reviews patched')
