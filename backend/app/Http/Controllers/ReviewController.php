<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'vendor_store_id' => ['nullable', 'exists:vendor_stores,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = Review::updateOrCreate(
            ['user_id' => Auth::id(), 'product_id' => $validated['product_id']],
            array_merge($validated, ['user_id' => Auth::id()])
        );

        return response()->json(['message' => 'Review submitted.', 'review' => $review], 201);
    }

    public function productReviews(Product $product)
    {
        $reviews = Review::where('product_id', $product->id)
            ->with('user')
            ->latest()
            ->paginate(15);

        return response()->json($reviews);
    }
}
