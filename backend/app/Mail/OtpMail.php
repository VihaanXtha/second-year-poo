<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $type;

    public function __construct(string $code, string $type)
    {
        $this->code = $code;
        $this->type = $type;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: match ($this->type) {
                'email_verification' => 'Verify Your Email - Circuit Bazaar',
                'phone_verification' => 'Verify Your Phone - Circuit Bazaar',
                'password_reset' => 'Reset Your Password - Circuit Bazaar',
                default => 'Your OTP Code - Circuit Bazaar',
            },
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'type' => $this->type,
            ],
        );
    }
}