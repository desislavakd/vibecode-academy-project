<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'role'                    => UserRole::class,
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function hasRole(UserRole $role): bool
    {
        return $this->role === $role;
    }

    public function isOwner(): bool
    {
        return $this->role === UserRole::Owner;
    }

    public function tools(): HasMany
    {
        return $this->hasMany(Tool::class, 'created_by');
    }
}
