<?php

namespace App\Models;

use App\Enums\Category\CategoryType;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public $timestamps = false;

    public $casts = [
        'categorizable_type' => CategoryType::class,
        'localization' => 'array'
    ];

    protected $guarded = [];

    public function scopeMarketplace()
    {
        return $this->where('categorizable_type', CategoryType::PRODUCT)->whereNull('parent_id');    
    }

    public function scopeJobs()
    {
        return $this->where('categorizable_type', CategoryType::JOB)->whereNull('parent_id');    
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id', 'id');
    }

    public function getCategoryNameAttribute()
    {
        $localization = $this->localization;
        $locale = app()->getLocale();
        
        return (isset($localization[$locale])) ? $localization[$locale] : $this->name;
    }

    public static function getMarketplaceCategories()
    {
        return self::query()->marketplace()->select('id', 'name')->get()->map(function ($item) {
            return [
                'key' => $item->id,
                'value' => $item->name
            ];
        })->toArray();
    }

    public static function getJobCategories()
    {
        return self::query()->jobs()->select('id', 'name')->get()->map(function ($item) {
            return [
                'key' => $item->id,
                'value' => $item->name
            ];
        })->toArray();
    }
}
