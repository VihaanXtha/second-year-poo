<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MediaStorageService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    /**
     * Folders the admin portal may upload into.
     * Files land on the local public disk: storage/app/public/circuit-bazaar/{folder}/
     */
    private const ALLOWED_FOLDERS = [
        'blog',
        'brands',
        'sliders',
        'advertisements',
        'testimonials',
        'categories',
        'sub-categories',
        'super-sub-categories',
        'products',
        'stores',
    ];

    /**
     * Store an uploaded image locally and return its public URL.
     * POST /api/admin/uploads/image  { image: File, folder?: string }
     */
    public function image(Request $request)
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:5120'],
            'folder' => ['nullable', 'string', Rule::in(self::ALLOWED_FOLDERS)],
        ]);

        $folder = $validated['folder'] ?? 'uploads';

        $media = new MediaStorageService;
        $url = $media->upload($request->file('image'), 'circuit-bazaar/'.$folder);

        if (! $url) {
            return response()->json(['message' => 'Upload failed.'], 422);
        }

        return response()->json(['url' => $url]);
    }
}
