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

namespace App\Http\Resources\User\Chat;

use App\Support\Num;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\User\User\UserDeletedResource;
use App\Http\Resources\User\User\UserPreviewResource;

class ChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $unreadMessagesCount = $this->resource->getUnreadMessagesCount();

        $chatItem = [
            'chat_id' => $this->chat_id,
            'type' => $this->type->value,
            'unread_messages_count' => [
                'raw' => $unreadMessagesCount,
                'formatted' => Num::abbreviate($unreadMessagesCount)
            ],
            'last_activity' => [
                'time_ago' => $this->last_activity->getTimeAgo(),
                'raw' => $this->last_activity->getTimestamp()
            ],
            'last_message' => null,
            'is_deleted' => false
        ];

        if ($this->type->isDirect()) {

            $interlocutor = $this->interlocutor;

            if(isset($interlocutor->user) && $interlocutor->user) {
                $chatItem['chat_info'] = UserPreviewResource::make($this->interlocutor->user);
            }
            else {
                $chatItem['chat_info'] = UserDeletedResource::make();
            }
        }

        if (! empty($this->lastMessage)) {
            if ($this->lastMessage->is_deleted) {
                $chatItem['is_deleted'] = true;
            }
            else {
                $chatItem['last_message'] = $this->lastMessage->content;
            }
        }

        return $chatItem;
    }
}
