<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuperSubCategory extends Model
{
    use HasFactory;

    protected $fillable = ['sub_category_id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }
}
