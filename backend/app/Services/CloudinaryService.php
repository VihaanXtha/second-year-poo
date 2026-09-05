<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Exception\MediaApiException;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private Cloudinary $client;

    public function __construct()
    {
        $this->client = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key'    => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
        ]);
    }

    public function upload(UploadedFile $file, ?string $folder = 'circuit-bazaar/products'): ?string
    {
        try {
            $result = $this->client->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'image',
                'allowed_formats' => ['jpg', 'jpeg', 'png', 'webp'],
                'transformation' => [
                    ['quality' => 'auto'],
                    ['fetch_format' => 'auto'],
                ],
            ]);

            return $result['secure_url'] ?? null;
        } catch (MediaApiException $e) {
            \Log::error('Cloudinary upload failed: ' . $e->getMessage());

            return null;
        }
    }
}
