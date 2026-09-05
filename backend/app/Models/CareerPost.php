<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CareerPost extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'description', 'requirements', 'is_published'];

    protected $casts = [
        'requirements' => 'array',
        'is_published' => 'boolean',
    ];
}
