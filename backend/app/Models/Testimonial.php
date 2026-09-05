<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'role', 'company', 'content', 'photo', 'rating', 'is_published'];

    protected $casts = [
        'is_published' => 'boolean',
        'rating' => 'integer',
    ];
}
