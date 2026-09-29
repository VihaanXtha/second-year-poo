import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\pages\Analytics.tsx')
t = p.read_text(encoding='utf-8')
old = "interface AnalyticsProps {\n  apiFetch: ApiFetch;\n}"
new = """interface AnalyticsProps {
  apiFetch: ApiFetch;
}

interface DayPoint {
  date: string;
  orders: number;
}"""
assert old in t
t = t.replace(old, new, 1)
old2 = "                <OrdersChart data={data.by_day.map((d) => ({ date: d.date, orders: d.orders }))} />"
new2 = "                <OrdersChart data={data.by_day.map((d: DayPoint) => ({ date: d.date, orders: d.orders }))} />"
assert old2 in t
t = t.replace(old2, new2, 1)
p.write_text(t, encoding='utf-8')
print('analytics patched')
