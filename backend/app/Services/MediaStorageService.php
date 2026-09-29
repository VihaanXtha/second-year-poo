<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Local media storage for the whole platform.
 *
 * Every upload through the API (images and PDFs) is written to local disks —
 * no external CDN is involved:
 *   - public disk  → storage/app/public/{folder}/  served at {APP_URL}/storage/{folder}/{file}
 *   - private disk → storage/app/private/...       streamed through controllers (e.g. 'cvs')
 */
class MediaStorageService
{
    public function upload(UploadedFile $file, ?string $folder = 'circuit-bazaar/products'): ?string
    {
        return $this->storeLocally($file, $folder);
    }

    public function uploadRaw(UploadedFile $file, ?string $folder = 'circuit-bazaar/cvs'): ?string
    {
        return $this->storeLocally($file, $folder);
    }

    /**
     * Legacy helper — leave untouched URLs with a size/quality transformation.
     * Only old Cloudinary delivery URLs contain '/upload/'; local /storage/...
     * URLs (and every other URL) are returned unchanged.
     */
    public function deliveryUrl(string $url, int $width = 1200, int|string $quality = 'auto', string $format = 'auto'): string
    {
        if (str_contains($url, '/upload/')) {
            return str_replace(
                '/upload/',
                '/upload/c_limit,w_'.$width.',q_'.$quality.',f_'.$format.'/',
                $url
            );
        }

        return $url;
    }

    /**
     * Store an uploaded file locally on the 'public' disk and return its URL.
     * Files are stored under storage/app/public/{folder}/ and served via
     * the public/storage symlink at {APP_URL}/storage/{folder}/{filename}.
     */
    private function storeLocally(UploadedFile $file, string $folder): ?string
    {
        try {
            $path = $file->store($folder, 'public');

            return Storage::disk('public')->url($path);
        } catch (\Exception $e) {
            Log::error('Local file storage failed: '.$e->getMessage());

            return null;
        }
    }
}
