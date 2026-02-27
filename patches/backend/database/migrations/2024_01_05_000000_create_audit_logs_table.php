<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name');                          // snapshot — survives user deletion
            $table->string('user_role')->default('');
            $table->enum('action', ['created', 'updated', 'approved', 'rejected', 'deleted']);
            $table->unsignedBigInteger('tool_id')->nullable();    // null when tool is deleted
            $table->string('tool_name');                          // snapshot
            $table->json('metadata')->nullable();                 // extra context (e.g. old status)
            $table->timestamps();

            $table->index(['action']);
            $table->index(['tool_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
