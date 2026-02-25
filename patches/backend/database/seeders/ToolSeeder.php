<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    public function run(): void
    {
        $owner     = User::where('role', 'owner')->first();
        $codecat   = Category::where('name', 'Code Assistants')->first();
        $writingcat = Category::where('name', 'AI Writing')->first();
        $freemium  = Tag::where('slug', 'freemium')->first();
        $apiTag    = Tag::where('slug', 'api')->first();

        $tools = [
            [
                'data' => [
                    'name'              => 'GitHub Copilot',
                    'url'               => 'https://github.com/features/copilot',
                    'description'       => 'AI pair programmer, интегриран в IDE. Предлага code completions в реално време директно в редактора.',
                    'how_to_use'        => 'Инсталирай VS Code extension, влез с GitHub акаунт и кодирай — Copilot предлага completions автоматично.',
                    'documentation_url' => 'https://docs.github.com/en/copilot',
                    'status'            => 'published',
                    'created_by'        => $owner->id,
                ],
                'categories' => [$codecat?->id],
                'roles'      => ['backend', 'frontend'],
                'tags'       => [$freemium?->id, $apiTag?->id],
            ],
            [
                'data' => [
                    'name'              => 'ChatGPT',
                    'url'               => 'https://chat.openai.com',
                    'description'       => 'Генеративен AI чатбот от OpenAI. Поддържа писане, анализ на код, преводи и много повече.',
                    'how_to_use'        => 'Отвори сайта, влез с акаунт и задавай въпроси в chat interface-а. Поддържа и системни инструкции.',
                    'documentation_url' => 'https://platform.openai.com/docs',
                    'status'            => 'published',
                    'created_by'        => $owner->id,
                ],
                'categories' => [$writingcat?->id, $codecat?->id],
                'roles'      => ['backend', 'frontend', 'qa', 'designer', 'pm', 'owner'],
                'tags'       => [$freemium?->id, $apiTag?->id],
            ],
            [
                'data' => [
                    'name'        => 'Notion AI',
                    'url'         => 'https://notion.so',
                    'description' => 'AI assistant вграден в Notion. Помага за писане, обобщаване и организиране на бележки и документи.',
                    'how_to_use'  => 'В Notion документ натисни Space за да активираш AI. Можеш да поискаш да напише, преработи или обобщи съдържание.',
                    'status'      => 'published',
                    'created_by'  => $owner->id,
                ],
                'categories' => [$writingcat?->id],
                'roles'      => ['pm', 'designer', 'qa'],
                'tags'       => [$freemium?->id],
            ],
        ];

        foreach ($tools as $item) {
            $tool = Tool::firstOrCreate(
                ['name' => $item['data']['name']],
                $item['data']
            );

            $categoryIds = array_filter($item['categories'] ?? []);
            if ($categoryIds) {
                $tool->categories()->sync($categoryIds);
            }

            $tool->syncRoles($item['roles']);

            $tagIds = array_filter($item['tags'] ?? []);
            if ($tagIds) {
                $tool->tags()->sync($tagIds);
            }

            $this->command->info("Seeded tool: {$tool->name}");
        }
    }
}
