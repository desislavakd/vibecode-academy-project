<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Expand enum to include both old and new values
        DB::statement("ALTER TABLE tools MODIFY COLUMN status ENUM('draft','published','pending','approved','rejected') DEFAULT 'pending'");

        // Step 2: Migrate existing data
        DB::statement("UPDATE tools SET status = 'approved' WHERE status = 'published'");
        DB::statement("UPDATE tools SET status = 'pending'  WHERE status = 'draft'");

        // Step 3: Remove old values, keep only new enum
        DB::statement("ALTER TABLE tools MODIFY COLUMN status ENUM('pending','approved','rejected') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tools MODIFY COLUMN status ENUM('pending','approved','rejected','draft','published') DEFAULT 'pending'");
        DB::statement("UPDATE tools SET status = 'published' WHERE status = 'approved'");
        DB::statement("UPDATE tools SET status = 'draft'     WHERE status IN ('pending','rejected')");
        DB::statement("ALTER TABLE tools MODIFY COLUMN status ENUM('draft','published') DEFAULT 'published'");
    }
};
