import pathlib
p = pathlib.Path(r'c:\1.D drive\second-year-poo\vendor\src\pages\Products.tsx')
t = p.read_text(encoding='utf-8')

old_state = """  const [form, setForm] = useState<ProductForm>(blankForm);
  const [saving, setSaving] = useState(false);"""
new_state = """  const [form, setForm] = useState<ProductForm>(blankForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);"""
assert old_state in t, 'state block not found'
t = t.replace(old_state, new_state, 1)

old_create = """  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setOpenForm(true);
  };"""
new_create = """  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setImageFile(null);
    setOpenForm(true);
  };"""
assert old_create in t, 'openCreate not found'
t = t.replace(old_create, new_create, 1)

old_edit = """  const openEdit = (product: Product) => {
    setEditing(product);"""
new_edit = """  const openEdit = (product: Product) => {
    setEditing(product);
    setImageFile(null);"""
assert old_edit in t, 'openEdit not found'
t = t.replace(old_edit, new_edit, 1)

old_input = """              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((f) => ({
                      ...f,
                      imagePreview: reader.result as string,
                      image: '',
                    }));
                  };
                  reader.readAsDataURL(file);
                } else {
                  setForm((f) => ({ ...f, imagePreview: null, image: f.image }));
                }
              }}"""
new_input = """              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((f) => ({
                      ...f,
                      imagePreview: reader.result as string,
                      image: '',
                    }));
                  };
                  reader.readAsDataURL(file);
                } else {
                  setForm((f) => ({ ...f, imagePreview: f.image || null }));
                }
              }}"""
assert old_input in t, 'file input not found'
t = t.replace(old_input, new_input, 1)
p.write_text(t, encoding='utf-8')
print('imageFile patched')
