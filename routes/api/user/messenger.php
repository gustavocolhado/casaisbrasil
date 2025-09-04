<?php
/*
|--------------------------------------------------------------------------
| ColibriPlus - The Ultimate Social Network Web Application.
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

use Illuminate\Support\Facades\Route;

Route::get('/chats', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'getChats']);
Route::get('/unread/count', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'getUnreadCount']);
Route::post('/chats/create', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'createChat']);
Route::post('/chats/launch', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'launchChat']);
Route::post('/chats/launcher-send', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'launcherSendMessage']);
Route::post('/send', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'sendMessage']);
Route::get('/chat/{chatId}', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'getChatData']);
Route::post('/chat/message/add-reaction', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'addReaction']);
Route::delete('/chat/message/delete', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'deleteMessage']);
Route::get('/chat/{chatId}/messages', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'getChatMessages']);
Route::get('/chat/{chatId}/participants', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'getChatParticipants']);
Route::delete('/chat/{chatId}/clear', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'clearConversation']);
Route::delete('/chat/{chatId}/delete', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'deleteChat']);
Route::get('/chat/{chatId}/read', [App\Http\Controllers\Api\User\Chat\ChatController::class, 'markAsRead']);