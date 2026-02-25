<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolRole extends Model
{
    public $timestamps = false;

    protected $fillable = ['tool_id', 'role'];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
