<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleAuthCode extends Model
{
    protected $fillable = [
        'code_hash',
        'user_id',
        'requires_profile_completion',
        'requires_phone_verification',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'requires_profile_completion' => 'boolean',
        'requires_phone_verification' => 'boolean',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
