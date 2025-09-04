<?php

namespace App\Http\Resources\User\Overview;

use App\Support\Num;
use Illuminate\Http\Request;
use App\Constants\Relationship;
use Illuminate\Http\Resources\Json\JsonResource;

class UserOverviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'username' => $this->username,
            'caption' => (empty($this->caption)) ? null : $this->caption,
            'avatar_url' => $this->avatar_url,
            'description' => $this->bio,
            'verified' => $this->isVerified(),
            'followers_count' => [
                'raw' => $this->followers_count,
                'formatted' => Num::abbreviate($this->followers_count)
            ],
            'last_active' => [
                'raw' => $this->getLastActive()->getTimestamp(),
                'formatted' => $this->getLastActive()->getCalendar()
            ],
            'meta' => [
                'relationship' => [
                    Relationship::FOLLOW_GROUP => [
                        Relationship::FOLLOWED_BY => $this->isFollowing(me())
                    ]
                ]
            ]
        ];
    }
}
