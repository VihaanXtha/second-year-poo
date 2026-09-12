<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/nepal-address.json', function () {
    $path = public_path('nepal-address.json');

    if (! File::exists($path)) {
        abort(404);
    }

    return response()->json(json_decode(File::get($path), true));
});
