<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogSyncItem extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'payload' => 'array',
        'baseline' => 'array',
        'issues' => 'array',
        'images' => 'array',
        'image_cursor' => 'integer',
        'images_ready' => 'boolean',
        'skipped' => 'boolean',
    ];
}
