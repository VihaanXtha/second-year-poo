<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VendorCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $email;
    public $password;
    public $portalUrl;

    public function __construct(string $email, string $password, ?string $portalUrl = null)
    {
        $this->email = $email;
        $this->password = $password;
        $this->portalUrl = $portalUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Vendor Portal Credentials - Circuit Bazaar',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor-credentials',
            with: [
                'email' => $this->email,
                'password' => $this->password,
                'portalUrl' => $this->portalUrl,
            ],
        );
    }
}
