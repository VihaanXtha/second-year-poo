<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::orderByDesc('id')->get(['id', 'name', 'slug', 'logo', 'description', 'website', 'is_active', 'created_at', 'updated_at']);
        return response()->json(['brands' => $brands]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:brands,slug'],
            'logo' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $brand = Brand::create($validated);

        return response()->json(['message' => 'Brand created.', 'brand' => $brand], 201);
    }

    public function show(Brand $brand)
    {
        return response()->json(['brand' => $brand]);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:brands,slug,' . $brand->id],
            'logo' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $brand->update($validated);

        return response()->json(['message' => 'Brand updated.', 'brand' => $brand]);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        return response()->json(['message' => 'Brand deleted.']);
    }
}
