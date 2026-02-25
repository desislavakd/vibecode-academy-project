<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tag;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ToolController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $query = Tool::with(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
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
            'status'            => 'published',
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

        $tool->update($request->only([
            'name', 'url', 'description', 'how_to_use', 'documentation_url',
        ]));

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

        return new ToolResource(
            $tool->load(['author', 'categories', 'toolRoles', 'tags', 'screenshots', 'examples'])
        );
    }

    public function destroy(Tool $tool): Response
    {
        Gate::authorize('delete', $tool);

        $tool->delete();

        return response()->noContent();
    }
}
