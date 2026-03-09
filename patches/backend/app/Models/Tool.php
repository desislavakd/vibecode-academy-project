<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use App\Models\ToolRole;

class Tool extends Model
{
    protected $fillable = [
        'name',
        'url',
        'description',
        'how_to_use',
        'documentation_url',
        'status',
        'created_by',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'tool_categories');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tool_tags');
    }

    public function toolRoles(): HasMany
    {
        return $this->hasMany(ToolRole::class);
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(ToolScreenshot::class)->orderBy('sort_order');
    }

    public function examples(): HasMany
    {
        return $this->hasMany(ToolExample::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ToolRating::class);
    }

    public function syncRoles(array $roles): void
    {
        $this->toolRoles()->delete();
        $unique = array_unique($roles);
        if (!empty($unique)) {
            ToolRole::insert(
                array_map(fn ($r) => ['tool_id' => $this->id, 'role' => $r], $unique)
            );
        }
    }

    public function syncTagsFromNames(array $names): void
    {
        if (empty($names)) {
            $this->tags()->sync([]);
            return;
        }

        // Build slug→name map (deduplicated)
        $slugMap = collect(array_unique($names))
            ->mapWithKeys(fn ($name) => [Str::slug($name) => $name]);

        // One SELECT for existing tags
        $existing = Tag::whereIn('slug', $slugMap->keys()->all())->pluck('id', 'slug');

        // One batch INSERT for new ones
        $newSlugs = $slugMap->keys()->diff($existing->keys())->values();
        if ($newSlugs->isNotEmpty()) {
            Tag::upsert(
                $newSlugs->map(fn ($slug) => ['name' => $slugMap[$slug], 'slug' => $slug])->all(),
                ['slug'],
                ['name']
            );
        }

        // One SELECT to get final IDs (existing + newly created)
        $tagIds = Tag::whereIn('slug', $slugMap->keys()->all())->pluck('id');
        $this->tags()->sync($tagIds);
    }

    public function syncScreenshots(array $data): void
    {
        $this->screenshots()->delete();
        foreach ($data as $item) {
            if (!empty($item['url'])) {
                $this->screenshots()->create([
                    'url'     => $item['url'],
                    'caption' => $item['caption'] ?? null,
                ]);
            }
        }
    }

    public function syncExamples(array $data): void
    {
        $this->examples()->delete();
        foreach ($data as $item) {
            if (!empty($item['title'])) {
                $this->examples()->create($item);
            }
        }
    }
}
