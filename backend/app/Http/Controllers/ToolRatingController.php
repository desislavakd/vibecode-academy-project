<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\ToolRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ToolRatingController extends Controller
{
    /**
     * POST /api/tools/{tool}/rate
     * Upsert the authenticated user's rating for a tool.
     * Returns the new average and count so the frontend updates in place.
     */
    public function upsert(Request $request, Tool $tool): JsonResponse
    {
        $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        ToolRating::updateOrCreate(
            ['tool_id' => $tool->id, 'user_id' => $request->user()->id],
            ['rating'  => $request->rating]
        );

        // Invalidate the listing cache so the updated average is reflected promptly
        Cache::forget('tools:approved:page1');

        $tool->loadAvg('ratings', 'rating')->loadCount('ratings');

        return response()->json([
            'average'     => round((float) $tool->ratings_avg_rating, 1),
            'count'       => $tool->ratings_count,
            'user_rating' => $request->rating,
        ]);
    }
}
