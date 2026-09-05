<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = ['job_posting_id', 'full_name', 'email', 'phone', 'notice_period', 'cv_url', 'submitted_at'];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }
}
