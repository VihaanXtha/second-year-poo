<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourierInfo extends Model
{
    use HasFactory;

    protected $table = 'courier_info';

    protected $fillable = ['title', 'body', 'delivery_zones'];

    protected $casts = [
        'delivery_zones' => 'array',
    ];
}
