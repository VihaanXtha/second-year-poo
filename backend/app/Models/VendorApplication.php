<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'full_name',
    'email',
    'phone',
    'store_name',
    'description',
    'website',
    'pan_number',
    'address',
    'country',
    'province',
    'district',
    'municipality',
    'ward',
    'postal_code',
    'experience',
    'otp_code',
    'otp_expires_at',
    'otp_verified_at',
    'status',
])]
class VendorApplication extends Model
{
    protected $casts = [
        'otp_expires_at' => 'datetime',
        'otp_verified_at' => 'datetime',
        'phone_otp_expires_at' => 'datetime',
        'phone_otp_verified_at' => 'datetime',
    ];
}
