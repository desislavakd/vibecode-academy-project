<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Tool;
use App\Models\User;

class ToolPolicy
{
    public function update(User $user, Tool $tool): bool
    {
        return true;
    }

    public function delete(User $user, Tool $tool): bool
    {
        return $user->id === $tool->created_by
            || $user->role === UserRole::Owner;
    }
}
