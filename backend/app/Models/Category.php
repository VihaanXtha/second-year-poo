<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'image', 'icon', 'display_order', 'is_active', 'spec_schema'];

    protected $casts = [
        'spec_schema' => 'array',
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class);
    }
}
