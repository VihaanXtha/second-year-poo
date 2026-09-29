import pathlib
base = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\app\Http\Controllers')
p = base / 'VendorController.php'
t = p.read_text(encoding='utf-8')

# ---------- createProduct: accept category string, specs JSON string, fix status, SKU fallback ----------
old_val = """        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive,draft'],
        ]);

        $category = Category::findOrFail($validated['category_id']);
        $specErrors = $this->validateSpecs($request->input('specs', []), $category->spec_schema);"""
new_val = """        $specsInput = $request->input('specs', []);
        if (is_string($specsInput)) {
            $decoded = json_decode($specsInput, true);
            $specsInput = is_array($decoded) ? $decoded : [];
            $request->merge(['specs' => $specsInput]);
        }

        $validated = $request->validate([
            'category' => ['required_without:category_id', 'string', 'max:255'],
            'category_id' => ['required_without:category', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'specs' => ['nullable', 'array'],
            'status' => ['required', 'in:active,inactive,draft,out_of_stock'],
        ]);

        if (empty($validated['category_id'] ?? null) && ! empty($validated['category'] ?? null)) {
            $byName = Category::where('name', $validated['category'])->first();
            $bySlug = $byName ?: Category::where('slug', $validated['category'])->first();
            if ($bySlug) {
                $validated['category_id'] = $bySlug->id;
            } else {
                return response()->json(['message' => 'Category not found: '.$validated['category']], 422);
            }
        }

        if (empty($validated['sku'] ?? null)) {
            $validated['sku'] = 'SKU-'.strtoupper(substr(md5($validated['name'].microtime(true)), 0, 8));
        }
        unset($validated['category']);

        $category = Category::findOrFail($validated['category_id']);
        $specErrors = $this->validateSpecs($request->input('specs', []), $category->spec_schema);"""
assert old_val in t, 'createProduct validation block not found'
t = t.replace(old_val, new_val, 1)

old_img = """        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
        } else {
            $validated['image'] = null;
        }

        $product = Product::create($validated);"""
new_img = """        } elseif ($request->filled('image')) {
            $validated['image'] = $request->input('image');
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->input('image_url');
        } else {
            $validated['image'] = null;
        }

        $product = Product::create($validated);"""
assert old_img in t, 'createProduct image block not found'
t = t.replace(old_img, new_img, 1)

p.write_text(t, encoding='utf-8')
print('VendorController part 2 patched')
