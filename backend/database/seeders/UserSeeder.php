<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Users to seed.
     *
     * To add more users, simply append entries to this array.
     * Each entry requires: name, email, password, role.
     */
    private array $users = [
        [
            'name'     => 'Иван Иванов',
            'email'    => 'ivan@admin.local',
            'password' => 'password',
            'role'     => UserRole::Owner,
        ],
        [
            'name'     => 'Елена Петрова',
            'email'    => 'elena@frontend.local',
            'password' => 'password',
            'role'     => UserRole::Frontend,
        ],
        [
            'name'     => 'Петър Георгиев',
            'email'    => 'petar@backend.local',
            'password' => 'password',
            'role'     => UserRole::Backend,
        ],
    ];

    public function run(): void
    {
        foreach ($this->users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => bcrypt($data['password']),
                    'role'     => $data['role'],
                ]
            );

            $this->command->info("Seeded user: {$data['email']} [{$data['role']->value}]");
        }
    }
}
