<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1–5
            $table->timestamps();

            $table->unique(['tool_id', 'user_id']); // one vote per user per tool
            $table->index('tool_id');               // for withAvg queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_ratings');
    }
};
