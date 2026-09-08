<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Exception\ConfigurationException;
use Cloudinary\Exception\MediaApiException;
use Illuminate\Http\UploadedFile;

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
            \Log::warning('Cloudinary configuration error: '.$e->getMessage());
        }
    }

    public function upload(UploadedFile $file, ?string $folder = 'circuit-bazaar/products'): ?string
    {
        if (! $this->client) {
            return null;
        }

        try {
            $result = $this->client->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'image',
                'allowed_formats' => ['jpg', 'jpeg', 'png', 'webp'],
            ]);

            return $result['secure_url'] ?? null;
        } catch (MediaApiException $e) {
            \Log::error('Cloudinary upload failed: '.$e->getMessage());

            return null;
        }
    }

    public function uploadRaw(UploadedFile $file, ?string $folder = 'circuit-bazaar/cvs'): ?string
    {
        if (! $this->client) {
            return null;
        }

        try {
            $result = $this->client->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => 'raw',
                'allowed_formats' => ['pdf'],
            ]);

            return $result['secure_url'] ?? null;
        } catch (MediaApiException $e) {
            \Log::error('Cloudinary raw upload failed: '.$e->getMessage());

            return null;
        }
    }

    public function deliveryUrl(string $url, int $width = 1200, int|string $quality = 'auto', string $format = 'auto'): string
    {
        return str_replace(
            '/upload/',
            '/upload/c_limit,w_'.$width.',q_'.$quality.',f_'.$format.'/',
            $url
        );
    }
}
