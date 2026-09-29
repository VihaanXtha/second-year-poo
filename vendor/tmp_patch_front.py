import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\pages\Products.tsx')
t = p.read_text(encoding='utf-8')
old = "      const data = await apiFetch<{ categories: Category[] }>('/api/categories');"
new = "      const data = await apiFetch<{ categories: Category[] }>('/categories');"
assert old in t
t = t.replace(old, new, 1)
p.write_text(t, encoding='utf-8')
print('products categories url patched')

p2 = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\pages\Dashboard.tsx')
t2 = p2.read_text(encoding='utf-8')
old2 = """        if (salesRes.status === 'fulfilled') {
          const list = Array.isArray(salesRes.value)
            ? salesRes.value
            : salesRes.value?.data ?? [];"""
new2 = """        if (salesRes.status === 'fulfilled') {
          const rawSales: any = salesRes.value;
          const list = Array.isArray(rawSales)
            ? rawSales
            : rawSales?.by_day ?? rawSales?.sales ?? rawSales?.data ?? [];"""
assert old2 in t2
t2 = t2.replace(old2, new2, 1)
p2.write_text(t2, encoding='utf-8')
print('dashboard sales mapping patched')
