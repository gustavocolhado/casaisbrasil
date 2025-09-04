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

namespace App\Http\Resources\User\People;

use Illuminate\Http\Request;
use App\Constants\Relationship;
use Illuminate\Http\Resources\Json\JsonResource;

class PeopleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cursor_id' => $this->cursor_id ?? null,
            'name' => $this->name,
            'avatar_url' => $this->avatar_url,
            'verified' => $this->isVerified(),
            'username' => $this->username,
            'caption' => $this->getCaption(),
            'website' => $this->website,
            'bio' => $this->bio,
            'meta' => [
                'relationship' => [
                    Relationship::FOLLOW_GROUP => [
                        Relationship::FOLLOWING => me()->isFollowing($this->resource),
                        Relationship::FOLLOWED_BY => $this->isFollowing(me()),
                        Relationship::REQUESTED_BY => false,
                        Relationship::REQUESTED => false
                    ]
                ]
            ]
        ];
    }
}
