<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
echo "DB_HOST from env: " . getenv('DB_HOST') . "\n";
echo "DB_HOST from $_ENV: " . ($_ENV['DB_HOST'] ?? 'not set') . "\n";
