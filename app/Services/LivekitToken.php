<?php

namespace App\Services;

use Firebase\JWT\JWT;

class LivekitToken
{
    public static function createToken(string $apiKey, string $apiSecret, string $room, string $identity, int $ttl = 3600): string
    {
        $now = time();
        $payload = [
            'iss' => $apiKey,
            'sub' => $identity,
            'exp' => $now + $ttl,
            'video' => [
                'roomJoin' => true,
                'room' => $room,
                'canPublish' => true,
                'canSubscribe' => true,
            ],
        ];

        return JWT::encode($payload, $apiSecret, 'HS256');
    }
}
