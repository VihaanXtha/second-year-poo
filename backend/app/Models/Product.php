<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['vendor_store_id', 'category_id', 'name', 'sku', 'description', 'price', 'stock', 'image', 'specs', 'status', 'featured'];

    protected $casts = [
        'specs' => 'array',
        'featured' => 'boolean',
    ];

    public function vendorStore(): BelongsTo
    {
        return $this->belongsTo(VendorStore::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function superSubCategory(): BelongsTo
    {
        return $this->belongsTo(SuperSubCategory::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
