<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\AuditLog;
use App\Models\Tag;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ToolController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $isOwner    = $request->user()->isOwner();
        $hasFilters = $request->hasAny(['search', 'role', 'category', 'tag', 'status']);
        $page       = (int) $request->input('page', 1);

        // Cache the default approved-tools view (no filters, page 1) for all roles.
        // This covers the "N инструмента в платформата" count and the initial listing.
        if (!$hasFilters && $page === 1) {
            $paginator = Cache::remember('tools:approved:page1', 300, function () {
                return Tool::with(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
                    ->where('status', 'approved')
                    ->latest()
                    ->paginate(15);
            });

            return ToolResource::collection($paginator);
        }

        // Owner + ?status=all → no filter (show every status, admin panel use case)
        // Owner + ?status=pending|approved|rejected → filter by that status
        // Everyone else (or owner without ?status) → approved only
        $query = Tool::with(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
            ->when(
                !($isOwner && $request->filled('status')),
                fn ($q) => $q->where('status', 'approved')
            )
            ->when(
                $isOwner && $request->filled('status') && $request->status !== 'all',
                fn ($q) => $q->where('status', $request->status)
            )
            ->when($request->search,   fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->role,     fn ($q, $r) => $q->whereHas('toolRoles', fn ($q) => $q->where('role', $r)))
            ->when($request->category, fn ($q, $c) => $q->whereHas('categories', fn ($q) => $q->where('slug', $c)))
            ->when($request->tag,      fn ($q, $t) => $q->whereHas('tags', fn ($q) => $q->where('slug', $t)))
            ->latest();

        return ToolResource::collection($query->paginate(15));
    }

    public function store(StoreToolRequest $request): ToolResource
    {
        $tool = Tool::create([
            'name'              => $request->name,
            'url'               => $request->url,
            'description'       => $request->description,
            'how_to_use'        => $request->how_to_use,
            'documentation_url' => $request->documentation_url,
            'status'            => $request->user()->isOwner() ? 'approved' : 'pending',
            'created_by'        => $request->user()->id,
        ]);

        if ($request->filled('categories')) {
            $tool->categories()->sync($request->categories);
        }

        $tool->syncRoles($request->input('roles', []));

        $tagIds = collect($request->input('tags', []))->map(function (string $name) {
            $slug = Str::slug($name);
            return Tag::firstOrCreate(['slug' => $slug], ['name' => $name])->id;
        });
        $tool->tags()->sync($tagIds);

        foreach ($request->input('screenshots', []) as $data) {
            if (!empty($data['url'])) {
                $tool->screenshots()->create([
                    'url'     => $data['url'],
                    'caption' => $data['caption'] ?? null,
                ]);
            }
        }

        foreach ($request->input('examples', []) as $data) {
            if (!empty($data['title'])) {
                $tool->examples()->create($data);
            }
        }

        $this->clearToolCache();
        Cache::forget('tags:all');

        AuditLog::record($request->user(), 'created', $tool);

        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    public function show(Tool $tool): ToolResource
    {
        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    public function update(UpdateToolRequest $request, Tool $tool): ToolResource
    {
        Gate::authorize('update', $tool);

        $fields    = ['name', 'url', 'description', 'how_to_use', 'documentation_url'];
        $oldValues = $tool->only($fields);

        $tool->update($request->only($fields));

        // Build a diff of changed scalar fields for the audit log
        $newValues = $tool->only($fields);
        $changes   = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $request->only($fields)) && $oldValues[$field] !== $newValues[$field]) {
                $changes[$field] = ['old' => $oldValues[$field], 'new' => $newValues[$field]];
            }
        }

        if ($request->has('categories')) {
            $tool->categories()->sync($request->input('categories', []));
        }

        if ($request->has('roles')) {
            $tool->syncRoles($request->input('roles', []));
        }

        if ($request->has('tags')) {
            $tagIds = collect($request->input('tags', []))->map(function (string $name) {
                $slug = Str::slug($name);
                return Tag::firstOrCreate(['slug' => $slug], ['name' => $name])->id;
            });
            $tool->tags()->sync($tagIds);
            Cache::forget('tags:all');
        }

        if ($request->has('screenshots')) {
            $tool->screenshots()->delete();
            foreach ($request->input('screenshots', []) as $data) {
                if (!empty($data['url'])) {
                    $tool->screenshots()->create([
                        'url'     => $data['url'],
                        'caption' => $data['caption'] ?? null,
                    ]);
                }
            }
        }

        if ($request->has('examples')) {
            $tool->examples()->delete();
            foreach ($request->input('examples', []) as $data) {
                if (!empty($data['title'])) {
                    $tool->examples()->create($data);
                }
            }
        }

        $this->clearToolCache();

        AuditLog::record($request->user(), 'updated', $tool, $changes);

        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    public function destroy(Tool $tool): Response
    {
        Gate::authorize('delete', $tool);

        // Snapshot before deletion so the log row keeps the name
        $actor    = request()->user();
        $toolName = $tool->name;
        $toolId   = $tool->id;

        $tool->delete();

        $this->clearToolCache();

        AuditLog::create([
            'user_id'    => $actor->id,
            'user_name'  => $actor->name,
            'user_role'  => $actor->role->value,
            'action'     => 'deleted',
            'tool_id'    => null,
            'tool_name'  => $toolName,
            'metadata'   => ['deleted_tool_id' => $toolId],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->noContent();
    }

    public function approve(Tool $tool): ToolResource
    {
        Gate::authorize('moderate', $tool);

        $tool->update(['status' => 'approved']);

        $this->clearToolCache();

        AuditLog::record(request()->user(), 'approved', $tool);

        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    public function reject(Tool $tool): ToolResource
    {
        Gate::authorize('moderate', $tool);

        $tool->update(['status' => 'rejected']);

        $this->clearToolCache();

        AuditLog::record(request()->user(), 'rejected', $tool);

        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    private function clearToolCache(): void
    {
        Cache::forget('tools:approved:page1');
    }
}
