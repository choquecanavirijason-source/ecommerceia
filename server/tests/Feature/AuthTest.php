<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'cliente', 'guard_name' => 'api']);

    User::create([
        'name' => 'Cliente Demo',
        'email' => 'cliente@unocompras.com',
        'password' => Hash::make('password'),
        'mobile_number' => '71234567',
        'address' => 'Av. Heroínas 123',
    ])->assignRole('cliente');
});

test('user can login and receive sanctum token', function () {
    $response = $this->postJson('/api/v1/login', [
        'email' => 'cliente@unocompras.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'access_token',
                'expires_at',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'permissions',
            ],
        ]);

    $token = $response->json('data.access_token');
    expect($token)->not->toBeEmpty();
});

test('authenticated user can access me endpoint and logout', function () {
    $loginResponse = $this->postJson('/api/v1/login', [
        'email' => 'cliente@unocompras.com',
        'password' => 'password',
    ]);

    $token = $loginResponse->json('data.access_token');

    // Test /me endpoint
    $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/me');

    $meResponse->assertStatus(200)
        ->assertJsonPath('data.user.email', 'cliente@unocompras.com');

    // Test /logout endpoint
    $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/logout');

    $logoutResponse->assertStatus(200)
        ->assertJson(['success' => true]);

    // Simulate subsequent request from client
    auth('api')->forgetUser();

    $afterLogoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/me');

    $afterLogoutResponse->assertStatus(401);
});
