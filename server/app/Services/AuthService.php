<?php

namespace App\Services;

use App\Models\User;
use App\Services\Exceptions\BusinessException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthService
{
    public function login(array $credentials): User
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw new BusinessException('Credenciales inválidas', Response::HTTP_UNAUTHORIZED);
        }

        return $user;
    }

    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'mobile_number' => $data['mobile_number'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        $user->assignRole('cliente');

        return $user;
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

    public function revokeToken(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        } else {
            $user->tokens()->delete();
        }
    }

    public function issueToken(User $user): array
    {
        $tokenResult = $user->createToken('PersonalAccessToken');

        return [
            'access_token' => $tokenResult->plainTextToken,
            'expires_at' => null,
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ];
    }
}