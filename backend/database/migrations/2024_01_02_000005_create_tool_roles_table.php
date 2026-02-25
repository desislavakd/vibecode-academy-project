<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_roles', function (Blueprint $table) {
            $table->foreignId('tool_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->primary(['tool_id', 'role']);
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_roles');
    }
};
