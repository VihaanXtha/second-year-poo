<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'department', 'location', 'employment_type', 'description', 'responsibilities', 'requirements', 'benefits', 'application_deadline', 'is_active'];

    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
        'is_active' => 'boolean',
        'application_deadline' => 'date',
    ];
}
