<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action',
        'tool_id',
        'tool_name',
        'tool_url',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record an audit log entry for a tool action.
     * IP address and user agent are captured automatically from the current request.
     */
    public static function record(
        User   $actor,
        string $action,
        Tool   $tool,
        array  $metadata = []
    ): self {
        return self::create([
            'user_id'    => $actor->id,
            'user_name'  => $actor->name,
            'user_role'  => $actor->role->value,
            'action'     => $action,
            'tool_id'    => $tool->id,
            'tool_name'  => $tool->name,
            'tool_url'   => $tool->url,
            'metadata'   => $metadata ?: null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
