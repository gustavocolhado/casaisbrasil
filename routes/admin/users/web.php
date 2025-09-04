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

Route::get('/', [App\Http\Controllers\Admin\User\UserController::class, 'index'])->name('admin.users.index');
Route::middleware('sided.layout')->get('/show/{userId}', [App\Http\Controllers\Admin\User\UserController::class, 'show'])->name('admin.users.show');
Route::middleware('sided.layout')->post('/delete/{userId}', [App\Http\Controllers\Admin\User\UserController::class, 'destroy'])->name('admin.users.destroy');