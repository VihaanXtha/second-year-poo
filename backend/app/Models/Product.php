<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['vendor_store_id', 'category_id', 'sub_category_id', 'super_sub_category_id', 'name', 'sku', 'description', 'price', 'discount_percent', 'stock', 'image', 'specs', 'status', 'featured'];

    protected $casts = [
        'specs' => 'array',
        'featured' => 'boolean',
        'discount_percent' => 'decimal:2',
    ];

    /**
     * Serialized alongside the original price so every consumer (shop lists,
     * cart, checkout) can show the discounted price without doing the math.
     */
    protected $appends = ['final_price'];

    public function getFinalPriceAttribute()
    {
        $discount = (float) ($this->attributes['discount_percent'] ?? 0);

        return round(((float) $this->attributes['price']) * (1 - $discount / 100), 2);
    }

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