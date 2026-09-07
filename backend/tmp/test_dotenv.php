<?php
require __DIR__ . '/../vendor/autoload.php';
use Dotenv\Repository\RepositoryBuilder;

$repo = RepositoryBuilder::create()->make();
$dotenv = \Dotenv\Dotenv::create($repo, __DIR__ . '/..');
$dotenv->safeLoad();
echo "DB_HOST=" . $repo->get('DB_HOST') . "\n";
