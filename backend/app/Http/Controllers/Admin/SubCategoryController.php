<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = SubCategory::query()->with('category:id,name');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $subCategories = $query->orderByDesc('display_order')->orderByDesc('id')->get(['id', 'category_id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active', 'created_at', 'updated_at']);

        return response()->json(['sub_categories' => $subCategories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $subCategory = SubCategory::create($validated);

        return response()->json(['message' => 'Sub-category created.', 'sub_category' => $subCategory], 201);
    }

    public function show(SubCategory $subCategory)
    {
        return response()->json(['sub_category' => $subCategory]);
    }

    public function update(Request $request, SubCategory $subCategory)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:sub_categories,slug,' . $subCategory->id],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $subCategory->update($validated);

        return response()->json(['message' => 'Sub-category updated.', 'sub_category' => $subCategory]);
    }

    public function destroy(SubCategory $subCategory)
    {
        $subCategory->delete();

        return response()->json(['message' => 'Sub-category deleted.']);
    }
}
