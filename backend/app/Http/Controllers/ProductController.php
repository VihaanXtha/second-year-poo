<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('status', 'active')->with(['vendorStore', 'category', 'reviews']);

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('sub_category')) {
            $query->where('sub_category_id', $request->sub_category);
        }

        if ($request->has('super_sub_category')) {
            $query->where('super_sub_category_id', $request->super_sub_category);
        }

        if ($request->has('brand')) {
            $query->where('brand_id', $request->brand);
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

        if ($request->has('spec')) {
            foreach ($request->spec as $key => $value) {
                if (! is_string($key) || $value === null || $value === '') {
                    continue;
                }
                $query->where("specs->$key", '=', (string) $value);
            }
        }

        if ($request->has('sort')) {
            match ($request->sort) {
                'price_asc' => $query->orderBy('price', 'asc'),
                'price_desc' => $query->orderBy('price', 'desc'),
                'newest' => $query->orderBy('created_at', 'desc'),
                'popular' => $query->withCount(['orderItems as total_sold' => function (Builder $query) {
                    $query->selectRaw('COALESCE(SUM(quantity), 0)');
                }])->orderBy('total_sold', 'desc'),
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
        $categories = Category::with(['subCategories' => function ($q) {
            $q->with(['superSubCategories']);
        }])->orderBy('display_order')->orderByDesc('id')->get(['id', 'name', 'slug', 'description', 'image', 'icon', 'display_order', 'is_active']);

        return response()->json(['categories' => $categories]);
    }

    public function specSchema(Category $category)
    {
        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'spec_schema' => $category->spec_schema ?? [],
        ]);
    }
}
