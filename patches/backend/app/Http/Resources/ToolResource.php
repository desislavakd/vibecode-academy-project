<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ToolResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'url'               => $this->url,
            'description'       => $this->description,
            'how_to_use'        => $this->how_to_use,
            'documentation_url' => $this->documentation_url,
            'status'            => $this->status,
            'created_by'        => [
                'id'   => $this->author->id,
                'name' => $this->author->name,
            ],
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'tags'       => TagResource::collection($this->whenLoaded('tags')),
            'roles'      => $this->whenLoaded('toolRoles', fn () =>
                $this->toolRoles->pluck('role')->values()
            ),
            'screenshots' => $this->whenLoaded('screenshots', fn () =>
                $this->screenshots->map(fn ($s) => [
                    'id'      => $s->id,
                    'url'     => $s->url,
                    'caption' => $s->caption,
                ])->values()
            ),
            'examples' => $this->whenLoaded('examples', fn () =>
                $this->examples->map(fn ($e) => [
                    'id'          => $e->id,
                    'title'       => $e->title,
                    'description' => $e->description,
                    'url'         => $e->url,
                ])->values()
            ),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
