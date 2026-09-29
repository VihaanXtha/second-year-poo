<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'kusha' => [
        'token' => env('KUSHA_SMS_TOKEN'),
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
    ],

    'esewa' => [
        'merchant_id' => env('ESEWA_MERCHANT_ID'),
        'secret_key' => env('ESEWA_SECRET_KEY'),
        'base_url' => env('ESEWA_BASE_URL', 'https://rc.esewa.com.np'),
    ],

    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'base_url' => env('STRIPE_BASE_URL', 'https://api.stripe.com'),
    ],

    // Sandbox default (dev.khalti.com); production uses https://khalti.com/api/v2.
    'khalti' => [
        'secret_key' => env('KHALTI_SECRET_KEY'),
        'base_url' => env('KHALTI_BASE_URL', 'https://dev.khalti.com/api/v2'),
    ],

    // Origin the gateways redirect the browser back to after paying.
    'shop' => [
        'url' => env('SHOP_URL', 'http://localhost:3003'),
    ],
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

];
