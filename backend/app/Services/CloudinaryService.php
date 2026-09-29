<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Exception\ConfigurationException;
use Cloudinary\Exception\MediaApiException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CloudinaryService
{
    private ?Cloudinary $client = null;

    public function __construct()
    {
        try {
            $this->client = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key' => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
            ]);
        } catch (ConfigurationException $e) {
            Log::info('Cloudinary not configured — using local storage fallback.');
        }
    }

    public function upload(UploadedFile $file, ?string $folder = 'circuit-bazaar/products'): ?string
    {
        // Local fallback when Cloudinary credentials are missing
        if (! $this->client) {
            return $this->storeLocally($file, $folder);
        }

        try {
            $result = $this->client->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'image',
                'allowed_formats' => ['jpg', 'jpeg', 'png', 'webp', 'svg'],
            ]);

            return $result['secure_url'] ?? null;
        } catch (MediaApiException $e) {
            Log::error('Cloudinary upload failed: '.$e->getMessage());

            return null;
        }
    }

    public function uploadRaw(UploadedFile $file, ?string $folder = 'circuit-bazaar/cvs'): ?string
    {
        // Local fallback when Cloudinary credentials are missing
        if (! $this->client) {
            return $this->storeLocally($file, $folder);
        }

        try {
            $result = $this->client->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'raw',
                'allowed_formats' => ['pdf'],
            ]);

            return $result['secure_url'] ?? null;
        } catch (MediaApiException $e) {
            Log::error('Cloudinary raw upload failed: '.$e->getMessage());

            return null;
        }
    }

    public function deliveryUrl(string $url, int $width = 1200, int|string $quality = 'auto', string $format = 'auto'): string
    {
        // Only transform Cloudinary URLs (they contain /upload/)
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
