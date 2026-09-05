<?php

return [

    'paths' => ['api/*', 'login', 'register', 'forgot-password'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://192.168.100.101:3000',
        'http://192.168.100.101:3001',
        'http://192.168.100.101:3002',
        'https://homecircuit.vercel.app',
        'https://shopcircuit-six.vercel.app',
        'https://admincircuit.vercel.app',
        'https://vendercircuit.vercel.app',
        'https://shopcircuit.vercel.app',
        'https://frontend.vercel.app',
        'https://shop.vercel.app',
        'https://admin.vercel.app',
        'https://vendor.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];