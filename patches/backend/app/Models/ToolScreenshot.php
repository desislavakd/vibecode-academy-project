<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolScreenshot extends Model
{
    protected $fillable = ['tool_id', 'url', 'storage_path', 'caption', 'sort_order'];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
