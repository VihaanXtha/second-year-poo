import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface ImageUploadProps {
  apiFetch: ApiFetch;
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Sub-folder under circuit-bazaar/ on the backend (e.g. "sliders"). */
  folder: string;
  hint?: string;
  /** Label classes; defaults to the standard form label used across admin pages. */
  labelClassName?: string;
  /** Preview box classes; defaults to a 16x16 rounded thumbnail. */
  previewClassName?: string;
}

/**
 * Local image upload field used across the admin portal.
 * Uploads to POST /admin/uploads/image (multipart) which stores the file on
 * the backend's local public disk and returns its URL. A "Paste URL" toggle
 * is kept so legacy external URLs stay editable.
 */
export function ImageUpload({ apiFetch, label, value, onChange, folder, hint, labelClassName, previewClassName }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', folder);
      const data = await apiFetch('/admin/uploads/image', { method: 'POST', body: fd });
      onChange(data.url as string);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={labelClassName || 'block text-sm font-medium text-slate-700'}>{label}</span>
        <button
          type="button"
          onClick={() => setShowUrlInput(v => !v)}
          className="text-xs text-primary hover:underline"
        >
          {showUrlInput ? 'Hide URL field' : 'Paste URL instead'}
        </button>
      </div>

      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt={`${label} preview`}
              className={previewClassName || 'h-16 w-16 rounded-lg border border-slate-200 object-cover bg-slate-50'}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove image"
              className="absolute -top-1.5 -right-1.5 bg-white border border-slate-200 rounded-full p-0.5 text-slate-400 hover:text-red-600 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </div>

          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}
