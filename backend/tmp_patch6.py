import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\backend\routes\api.php')
t = p.read_text(encoding='utf-8-sig')
old = """    Route::get('/store', [VendorController::class, 'myStore']);
"""
new = """    Route::get('/store', [VendorController::class, 'myStore']);
    Route::get('/dashboard/stats', [VendorController::class, 'dashboardStats']);
"""
assert old in t, 'vendor store route not found'
t = t.replace(old, new, 1)
p.write_text(t, encoding='utf-8')
print('route patched')
