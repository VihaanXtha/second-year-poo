<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('order.{id}', function ($user, $id) {
    $order = Order::findOrFail($id);

    return $order->user_id === $user->id || $user->role === 'admin';
});
