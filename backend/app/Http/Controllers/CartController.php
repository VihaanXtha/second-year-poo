<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * List the authenticated user's cart items, with product data eager-loaded
     * so the frontend can render line items in a single request.
     */
    public function index(Request $request)
    {
        $items = CartItem::with('product')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json(['cart_items' => $items]);
    }

    /**
     * Add a product to the cart. If it is already present, the quantity is
     * incremented (additive) rather than creating a duplicate row.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::findOrFail($request->product_id);

        if ($product->status !== 'active') {
            return response()->json(['message' => 'This product is not available.'], 422);
        }

        $quantity = $request->input('quantity', 1);

        $item = CartItem::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $item->quantity += $quantity;
            $item->save();
        } else {
            $item = CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }

        $item->load('product');

        return response()->json([
            'message' => 'Added to cart.',
            'cart_item' => $item,
        ], 201);
    }

    /**
     * Update the quantity of a specific cart item (set, not increment).
     */
    public function update(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        $cartItem->load('product');

        return response()->json([
            'message' => 'Cart item updated.',
            'cart_item' => $cartItem,
        ]);
    }

    /**
     * Remove a single cart item.
     */
    public function destroy(CartItem $cartItem)
    {
        if ($cartItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart.']);
    }

    /**
     * Clear the authenticated user's entire cart.
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }

    /**
     * Merge a guest's localStorage cart into the backend cart on login.
     * Accepts a list of {product_id, quantity} pairs; additive on conflict.
     */
    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = Auth::id();

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            // Skip products that no longer exist or are inactive.
            if (! $product || $product->status !== 'active') {
                continue;
            }

            $existing = CartItem::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->first();

            if ($existing) {
                $existing->quantity += $item['quantity'];
                $existing->save();
            } else {
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                ]);
            }
        }

        $items = CartItem::with('product')->where('user_id', $userId)->get();

        return response()->json([
            'message' => 'Cart merged.',
            'cart_items' => $items,
        ]);
    }
}
