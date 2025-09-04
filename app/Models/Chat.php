<?php

namespace App\Models;

use App\Enums\Chat\ChatType;
use App\Database\Configs\Table;
use App\Support\Casts\ModelTimestampCast;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    public $guarded = [];

    const UPDATED_AT = null;

    public $casts = [
        'type' => ChatType::class,
        'last_activity' => ModelTimestampCast::class,
        'created_at' => ModelTimestampCast::class
    ];

    public function scopeChatsHistory($query)
    {
        return $query->participatedChats()->whereNotNull('last_activity');
    }

    public function scopeParticipatedChats($query)
    {
        return $query->whereHas('participants', function ($q) {
            $q->whereIn('user_id', [me()->id]);
        })->excludeDeleted();
    }

    public function scopeExcludeDeleted($query)
    {
        return $query->whereNotIn('id', function ($subQuery) {
            $subQuery->select('chat_id')->from(Table::HIDDEN_CHATS)->where('user_id', me()->id);
        });
    }

    public function participants()
    {
        return $this->hasMany(ChatParticipant::class, 'chat_id', 'id');
    }

    public function interlocutor()
    {
        return $this->hasOne(ChatParticipant::class, 'chat_id', 'id')
            ->whereNot('user_id', me()->id)->with(['user' => function($query) {
                $query->withTrashed()->select(['first_name', 'last_name', 'id', 'avatar', 'username', 'verified']);
            }]);
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class, 'chat_id', 'id')
            ->latestOfMany('id')->excludeDeleted();
    }

    public function getUnreadMessagesCount()
    {
        $userParticipant = $this->participants()->where('user_id', me()->id)->first();

        if(empty($userParticipant) || empty($userParticipant->last_read_message_id)) {
            return $this->messages()->count();
        }

        return $this->messages()->where('id', '>', $userParticipant->last_read_message_id)->count();
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_id', 'id');
    }
}
