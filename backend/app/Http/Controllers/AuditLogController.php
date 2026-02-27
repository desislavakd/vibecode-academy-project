<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * DELETE /api/audit-logs/{auditLog}   (owner-only)
     * Permanently deletes a single audit log entry.
     */
    public function destroy(AuditLog $auditLog): JsonResponse
    {
        $auditLog->delete();

        return response()->json(['message' => 'Audit log entry deleted.']);
    }

    /**
     * GET /api/audit-logs   (owner-only)
     *
     * Query params:
     *   ?action=created|updated|approved|rejected|deleted
     *   ?search=<string>   — matches user_name or tool_name (case-insensitive)
     *   ?from=YYYY-MM-DD   — inclusive lower date bound
     *   ?to=YYYY-MM-DD     — inclusive upper date bound
     *   ?user_id=<int>
     *   ?page=<int>
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()
            ->when($request->action,  fn ($q, $a) => $q->where('action', $a))
            ->when($request->user_id, fn ($q, $u) => $q->where('user_id', $u))
            ->when($request->search,  fn ($q, $s) =>
                $q->where(fn ($q) =>
                    $q->where('user_name', 'like', "%{$s}%")
                      ->orWhere('tool_name', 'like', "%{$s}%")
                )
            )
            ->when($request->from, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->to,   fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => $query->items(),
            'meta' => [
                'total'     => $query->total(),
                'page'      => $query->currentPage(),
                'last_page' => $query->lastPage(),
            ],
        ]);
    }
}
