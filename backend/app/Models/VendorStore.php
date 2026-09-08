<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorStore extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'store_name', 'description', 'logo', 'banner', 'address', 'phone', 'verified', 'status'];

    protected $casts = [
        'verified' => 'boolean',
    ];

    protected $appends = ['logo_url', 'banner_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo;
    }

    public function getBannerUrlAttribute(): ?string
    {
        return $this->banner;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
