<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryController extends Controller
{
    public function index(): ResourceCollection
    {
        return CategoryResource::collection(Category::orderBy('name')->get());
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $category = Category::create([
            'name'        => $request->name,
            'description' => $request->description,
            'created_by'  => $request->user()->id,
        ]);

        return new CategoryResource($category);
    }
}
