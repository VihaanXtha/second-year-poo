<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Review;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('status', 'active')->with(['vendorStore', 'category', 'reviews']);

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('sort')) {
            match ($request->sort) {
                'price_asc' => $query->orderBy('price', 'asc'),
                'price_desc' => $query->orderBy('price', 'desc'),
                'newest' => $query->orderBy('created_at', 'desc'),
                'popular' => $query->orderBy('stock', 'desc'),
                default => $query->orderBy('created_at', 'desc'),
            };
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(24);

        return response()->json($products);
    }

    public function show(Product $product)
    {
        if ($product->status !== 'active') {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        $product->load(['vendorStore', 'category', 'reviews.user']);

        return response()->json(['product' => $product]);
    }

    public function categories()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        return response()->json(['categories' => $categories]);
    }
}
