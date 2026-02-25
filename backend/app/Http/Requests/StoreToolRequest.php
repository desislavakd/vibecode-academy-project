<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'                   => ['required', 'string', 'max:255'],
            'url'                    => ['required', 'url', 'max:500'],
            'description'            => ['required', 'string'],
            'how_to_use'             => ['nullable', 'string'],
            'documentation_url'      => ['nullable', 'url', 'max:500'],

            'categories'             => ['nullable', 'array'],
            'categories.*'           => ['integer', 'exists:categories,id'],

            'roles'                  => ['nullable', 'array'],
            'roles.*'                => ['string', Rule::in(UserRole::values())],

            'tags'                   => ['nullable', 'array'],
            'tags.*'                 => ['string', 'max:50'],

            'screenshots'            => ['nullable', 'array', 'max:5'],
            'screenshots.*.url'      => ['required', 'url', 'max:500'],
            'screenshots.*.caption'  => ['nullable', 'string', 'max:255'],

            'examples'               => ['nullable', 'array', 'max:5'],
            'examples.*.title'       => ['required', 'string', 'max:255'],
            'examples.*.description' => ['nullable', 'string'],
            'examples.*.url'         => ['nullable', 'url', 'max:500'],
        ];
    }
}
