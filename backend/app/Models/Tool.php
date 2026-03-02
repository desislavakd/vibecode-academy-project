<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

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
        foreach (array_unique($roles) as $role) {
            $this->toolRoles()->create(['role' => $role]);
        }
    }

    public function syncTagsFromNames(array $names): void
    {
        $tagIds = collect($names)->map(fn (string $name) =>
            Tag::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name])->id
        );
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
