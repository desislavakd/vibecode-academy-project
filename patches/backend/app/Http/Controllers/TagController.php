<?php

namespace App\Http\Controllers;

use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index(): ResourceCollection
    {
        return TagResource::collection(Tag::orderBy('name')->get());
    }

    public function store(Request $request): TagResource
    {
        $request->validate(['name' => 'required|string|max:50']);

        $slug = Str::slug($request->name);
        $tag  = Tag::firstOrCreate(['slug' => $slug], ['name' => $request->name]);

        return new TagResource($tag);
    }
}
