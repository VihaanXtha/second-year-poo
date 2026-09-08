<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderByDesc('display_order')->orderByDesc('id')->get(['id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active', 'spec_schema', 'created_at', 'updated_at']);
        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $category = Category::create($validated);

        return response()->json(['message' => 'Category created.', 'category' => $category], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['category' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $category->update($validated);

        return response()->json(['message' => 'Category updated.', 'category' => $category]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    public function updateSpecSchema(Request $request, Category $category)
    {
        $validated = $request->validate([
            'spec_schema' => ['required', 'array'],
        ]);

        $category->update(['spec_schema' => $validated['spec_schema']]);

        return response()->json(['message' => 'Spec schema updated.', 'category' => $category]);
    }
}
