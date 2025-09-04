<?php
/*
|--------------------------------------------------------------------------
| ColibriPlus - The Social Network Web Application.
|--------------------------------------------------------------------------
| Author: Mansur Terla. Full-Stack Web Developer, UI/UX Designer.
| Website: www.terla.me
| E-mail: mansurtl.contact@gmail.com
| Instagram: @mansur_terla
| Telegram: @mansurtl_contact
|--------------------------------------------------------------------------
| Copyright (c)  ColibriPlus. All rights reserved.
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Api\User\Explore;

use App\Models\User;
use Illuminate\Http\Request;
use App\Database\Configs\Table;
use App\Http\Controllers\Controller;
use App\Traits\Http\Api\SupportsApiResponses;
use App\Http\Resources\User\People\PeopleCollection;
use App\Traits\Http\Controllers\Api\User\Explore\ValidatesPeopleFilters;

class ExploreController extends Controller
{
    use SupportsApiResponses,
        ValidatesPeopleFilters;

    public function getPeople(Request $request)
    {
        $filterOptions = $this->getValidatedFilters($request);

        $people = User::active()->excludeSelf()->whereNotIn('id', function ($query) {
            $query->select('following_id')->from(Table::FOLLOWS)->where('follower_id', me()->id);
        })->unless(empty($filterOptions['query']), function ($query) use ($filterOptions) {
            $query->whereLike('username', "%{$filterOptions['query']}%");
        })
        ->orderByDesc('followers_count')
        ->orderByDesc('publications_count')
        ->simplePaginateManual(30, (! empty($filterOptions['page']) ? $filterOptions['page'] : 1));

        return $this->responseSuccess([
            'data' => PeopleCollection::make($people->items())
        ]);
    }
}
