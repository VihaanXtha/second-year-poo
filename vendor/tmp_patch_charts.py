import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\components\Charts.tsx')
t = p.read_text(encoding='utf-8')
old = "            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}"
new = "            formatter={(v: any) => [`$${Number(v ?? 0).toLocaleString()}`, 'Revenue']}"
assert old in t
t = t.replace(old, new, 1)
p.write_text(t, encoding='utf-8')
print('charts patched')
