<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomepageSlider extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'subtitle', 'image_url', 'button_text', 'button_link', 'display_order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
