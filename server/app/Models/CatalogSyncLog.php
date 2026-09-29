<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogSyncLog extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['session', 'state'];

    protected $casts = [
        'state' => 'array',
        'session' => 'encrypted:array',
        'counts' => 'array',
        'step' => 'integer',
        'scanned_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CatalogSyncItem::class);
    }
}
