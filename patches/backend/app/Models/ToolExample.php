<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolExample extends Model
{
    protected $fillable = ['tool_id', 'title', 'description', 'url'];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
