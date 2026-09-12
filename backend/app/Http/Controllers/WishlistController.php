<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * List the authenticated user's wishlist items, with product data eager-loaded.
     */
    public function index(Request $request)
    {
        $items = WishlistItem::with('product')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json(['wishlist_items' => $items]);
    }

    /**
     * Add a product to the wishlist. Idempotent: adding an already-saved
     * product simply returns the existing row.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'exists:products,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::findOrFail($request->product_id);

        if ($product->status !== 'active') {
            return response()->json(['message' => 'This product is not available.'], 422);
        }

        $item = WishlistItem::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if (! $item) {
            $item = WishlistItem::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
            ]);
        }

        $item->load('product');

        return response()->json([
            'message' => 'Added to wishlist.',
            'wishlist_item' => $item,
        ], 201);
    }

    /**
     * Remove a single wishlist item.
     */
    public function destroy(WishlistItem $wishlistItem)
    {
        if ($wishlistItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Item removed from wishlist.']);
    }

    /**
     * Toggle a product's wishlist status: add if absent, remove if present.
     * Convenience endpoint for a single heart button.
     */
    public function toggle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'exists:products,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::findOrFail($request->product_id);

        if ($product->status !== 'active') {
            return response()->json(['message' => 'This product is not available.'], 422);
        }

        $item = WishlistItem::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $item->delete();

            return response()->json(['added' => false, 'message' => 'Removed from wishlist.']);
        }

        $item = WishlistItem::create([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
        ]);
        $item->load('product');

        return response()->json(['added' => true, 'wishlist_item' => $item, 'message' => 'Added to wishlist.'], 201);
    }

    /**
     * Merge a guest's localStorage wishlist into the backend wishlist on login.
     * Accepts a list of {product_id} pairs; duplicates are ignored.
     */
    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = Auth::id();

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            if (! $product || $product->status !== 'active') {
                continue;
            }

            $existing = WishlistItem::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->first();

            if (! $existing) {
                WishlistItem::create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                ]);
            }
        }

        $items = WishlistItem::with('product')->where('user_id', $userId)->get();

        return response()->json([
            'message' => 'Wishlist merged.',
            'wishlist_items' => $items,
        ]);
    }
}
