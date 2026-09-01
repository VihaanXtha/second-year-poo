<?php

return [

    'paths' => ['api/*', 'login', 'register', 'forgot-password'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://192.168.100.101:3000',
        'http://192.168.100.101:3001',
        'http://192.168.100.101:3002',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];