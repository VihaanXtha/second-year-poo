<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SuperSubCategory;
use App\Models\SubCategory;
use Illuminate\Http\Request;

class SuperSubCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = SuperSubCategory::query()->with('subCategory:id,name');

        if ($request->has('sub_category_id')) {
            $query->where('sub_category_id', $request->sub_category_id);
        }

        $superSubCategories = $query->orderByDesc('display_order')->orderByDesc('id')->get(['id', 'sub_category_id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active', 'created_at', 'updated_at']);

        return response()->json(['super_sub_categories' => $superSubCategories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:super_sub_categories,slug'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $superSubCategory = SuperSubCategory::create($validated);

        return response()->json(['message' => 'Super sub-category created.', 'super_sub_category' => $superSubCategory], 201);
    }

    public function show(SuperSubCategory $superSubCategory)
    {
        return response()->json(['super_sub_category' => $superSubCategory]);
    }

    public function update(Request $request, SuperSubCategory $superSubCategory)
    {
        $validated = $request->validate([
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:super_sub_categories,slug,' . $superSubCategory->id],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $superSubCategory->update($validated);

        return response()->json(['message' => 'Super sub-category updated.', 'super_sub_category' => $superSubCategory]);
    }

    public function destroy(SuperSubCategory $superSubCategory)
    {
        $superSubCategory->delete();

        return response()->json(['message' => 'Super sub-category deleted.']);
    }
}
