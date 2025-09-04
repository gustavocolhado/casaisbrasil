<?php

namespace Database\Seeders;

use App\Enums\User\UserStatus;
use Illuminate\Database\Seeder;
use App\Actions\User\CreateUserAction;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $users = require(database_path('demo/data/users.php'));

        foreach ($users as $user) {
            $user['avatar'] = $this->uploadAvatar($user['avatar_path']);

            unset($user['avatar_path']);

            (new CreateUserAction(array_merge($user, [
                'status' => UserStatus::ACTIVE,
                'verified' => true,
                'tips' => [],
                'password' => bcrypt('123456')
            ])))->execute();
        }

        Schema::enableForeignKeyConstraints();
    }

    private function uploadAvatar(string $avatarPath)
    {
        $avatar = file_get_contents(base_path($avatarPath));
        $avatarName = basename($avatarPath);
        $hashName = sha1($avatarName);
        $avatarPath = "uploads/users/avatars/{$hashName}.png";
        
        Storage::disk('public')->put($avatarPath, $avatar);
        
        return $avatarPath;
    }
}
