<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    private array $categories = [
        ['name' => 'AI Writing',        'description' => 'Инструменти за писане и редактиране на текст с AI'],
        ['name' => 'Code Assistants',   'description' => 'AI помощници за писане и дебъгване на код'],
        ['name' => 'Image Generation',  'description' => 'Генериране и редактиране на изображения с AI'],
        ['name' => 'Data & Analytics',  'description' => 'Анализ на данни и визуализация'],
        ['name' => 'Design Tools',      'description' => 'Дизайн инструменти и прототипиране'],
        ['name' => 'Productivity',      'description' => 'Инструменти за повишаване на продуктивността'],
        ['name' => 'Research',          'description' => 'Инструменти за проучване и събиране на информация'],
        ['name' => 'Communication',     'description' => 'Комуникационни инструменти и чатботове'],
    ];

    public function run(): void
    {
        $owner = User::first();

        foreach ($this->categories as $data) {
            Category::firstOrCreate(
                ['name' => $data['name']],
                ['description' => $data['description'], 'created_by' => $owner->id]
            );
        }

        $this->command->info('Categories seeded: ' . count($this->categories));
    }
}
