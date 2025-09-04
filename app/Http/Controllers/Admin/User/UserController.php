<?php

namespace App\Http\Controllers\Admin\User;

use App\Models\User;
use App\Support\Views\Flash;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Actions\User\DeleteUserAction;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $searchKeyword = $request->string('search')->value;

        $users = User::when($searchKeyword, function ($query) use ($searchKeyword) {
            $query->where('name', 'like', "%{$searchKeyword}%")
                ->orWhere('email', 'like', "%{$searchKeyword}%");
        })->latest()->paginate(10);

        return view('admin::users.index.index', [
            'users' => $users,
        ]);
    }

    public function show(int $userId)
    {
        $userData = User::findOrFail($userId);

        return view('admin::users.show.index', [
            'userData' => $userData,
        ]);
    }

    public function destroy(int $userId)
    {
        $userData = User::findOrFail($userId);
        
        if(me()->id == $userData->id) {
            return redirect()->route('admin.users.index')->with('flashMessage', (new Flash(content: __('admin/flash.user.delete_self')))->get());
        }
        
        (new DeleteUserAction($userData))->execute();

        return redirect()->route('admin.users.index')->with('flashMessage', (new Flash(content: __('admin/flash.user.delete_success')))->get());
    }
}
