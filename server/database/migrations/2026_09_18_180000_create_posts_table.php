<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('category')->default('General');
            $table->string('category_color')->default('#18D6D1');
            $table->string('tag_bg')->nullable();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('image')->nullable();
            $table->string('read_time')->default('4 min de lectura');
            $table->string('icon')->default('BookOpen');
            $table->string('banner_gradient')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
