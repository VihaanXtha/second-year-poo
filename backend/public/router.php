<?php
// Router script for PHP built-in server
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');
$publicPath = __DIR__;

if ($uri !== '/' && file_exists($publicPath . $uri)) {
    return false;
}

// Set working directory to project root
chdir(dirname(__DIR__));

// Set APP_KEY explicitly
$_ENV['APP_KEY'] = 'base64:eJW6b99IJ9a0HVztUdjzqL79TkMRvJx8FZnxuq/GgQA=';
putenv('APP_KEY=base64:eJW6b99IJ9a0HVztUdjzqL79TkMRvJx8FZnxuq/GgQA=');

require $publicPath . '/index.php';
