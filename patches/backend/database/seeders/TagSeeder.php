<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    private array $tags = [
        'free', 'paid', 'freemium', 'open-source',
        'api', 'browser-extension', 'desktop-app', 'web-app',
        'no-code', 'requires-account', 'offline',
    ];

    public function run(): void
    {
        foreach ($this->tags as $name) {
            Tag::firstOrCreate(['slug' => $name], ['name' => $name]);
        }

        $this->command->info('Tags seeded: ' . count($this->tags));
    }
}
