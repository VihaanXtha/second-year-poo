import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\pages\Products.tsx')
t = p.read_text(encoding='utf-8')

old_form = """interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  imagePreview: string | null;
  status: 'active' | 'draft';
  specs: Record<string, unknown>;
}

const blankForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  imagePreview: null,
  status: 'active',
  specs: {},
};"""
new_form = """interface ProductForm {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  image: string;
  imagePreview: string | null;
  status: 'active' | 'draft';
  specs: Record<string, unknown>;
}

const blankForm: ProductForm = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  imagePreview: null,
  status: 'active',
  specs: {},
};

function categoryIdOf(cats: Category[], v: string): string {
  if (!v) return '';
  const found = cats.find((c) => String(c.id) === v || c.name === v);
  return found ? String(found.id) : v;
}"""
assert old_form in t, 'form block not found'
t = t.replace(old_form, new_form, 1)

old_submit = """    try {
      if (form.imagePreview) {
        const fd = new FormData();
        fd.append('name', form.name);
        if (form.sku) fd.append('sku', form.sku);
        if (form.description) fd.append('description', form.description);
        fd.append('category', form.category);
        fd.append('price', String(Number(form.price) || 0));
        fd.append('stock', String(Number(form.stock) || 0));
        fd.append('status', form.status);
        if (Object.keys(form.specs).length > 0) {
          fd.append('specs', JSON.stringify(form.specs));
        }
        fd.append('image', form.imagePreview);
        if (editing) {
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'PUT',
            body: fd,
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: fd,
          });
        }
      } else {
        const payload: Record<string, unknown> = {
          name: form.name,
          sku: form.sku || undefined,
          description: form.description || undefined,
          category: form.category,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          status: form.status,
        };
        if (Object.keys(form.specs).length > 0) {
          payload.specs = form.specs;
        }
        if (form.image) {
          payload.image = form.image;
        }
        if (editing) {
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
      }"""
new_submit = """    try {
      const categoryId = categoryIdOf(allCategories, form.category);
      if (imageFile) {
        const fd = new FormData();
        fd.append('name', form.name);
        if (form.sku) fd.append('sku', form.sku);
        if (form.description) fd.append('description', form.description);
        fd.append('category_id', categoryId);
        fd.append('price', String(Number(form.price) || 0));
        fd.append('stock', String(Number(form.stock) || 0));
        fd.append('status', form.status);
        if (Object.keys(form.specs).length > 0) {
          fd.append('specs', JSON.stringify(form.specs));
        }
        fd.append('image', imageFile);
        if (editing) {
          fd.append('_method', 'PUT');
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'POST',
            body: fd,
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: fd,
          });
        }
      } else {
        const payload: Record<string, unknown> = {
          name: form.name,
          sku: form.sku || undefined,
          description: form.description || undefined,
          category_id: categoryId,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          status: form.status,
        };
        if (Object.keys(form.specs).length > 0) {
          payload.specs = form.specs;
        }
        if (form.image && !form.imagePreview) {
          payload.image = form.image;
        }
        if (editing) {
          await apiFetch(`/vendor/products/${editing.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch('/vendor/products', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
      }"""
assert old_submit in t, 'submit block not found'
t = t.replace(old_submit, new_submit, 1)
p.write_text(t, encoding='utf-8')
print('submit patched')
