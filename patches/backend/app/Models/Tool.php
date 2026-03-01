<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
