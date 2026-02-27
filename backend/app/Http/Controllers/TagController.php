<?php

namespace App\Http\Controllers;

use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index(): ResourceCollection
    {
        $tags = Cache::remember('tags:all', 3600, function () {
            return Tag::orderBy('name')->get();
        });

        return TagResource::collection($tags);
    }

    public function store(Request $request): TagResource
    {
        $request->validate(['name' => 'required|string|max:50']);

        $slug = Str::slug($request->name);
        $tag  = Tag::firstOrCreate(['slug' => $slug], ['name' => $request->name]);

        Cache::forget('tags:all');

        return new TagResource($tag);
    }
}
