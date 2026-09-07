#!/bin/bash
export DB_HOST=mysql
php -r 'require "vendor/autoload.php"; $app = require_once "bootstrap/app.php"; echo getenv("DB_HOST") . PHP_EOL;'
