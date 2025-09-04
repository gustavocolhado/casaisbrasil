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

namespace App\Actions\User;

use App\Actions\Post\DeletePostAction;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class DeleteUserAction
{
    private User $userData;

    public function __construct(User $userData)
    {
        $this->userData = $userData;
    }

    public function execute()
    {
        $this->deleteUserPublications();

        $this->deleteUserWallet();

        $this->deleteUserStories();

        $this->deleteUserProducts();

        $this->deleteUserAds();

        $this->deleteUserJobs();

        $this->deleteUserNotifications();

        $this->deleteUserDevices();

        $this->resetUserChildAccounts();

        $this->deleteUserPayments();

        $this->deleteUserComments();

        $this->deleteUserSocialAccounts();

        if (! $this->userData->hasDefaultAvatar() && ! empty($this->userData->avatar)) {
            Storage::disk(config('user.disks.avatar'))->delete($this->userData->avatar);
            Storage::disk(config('user.disks.cover'))->delete($this->userData->cover);
        }

        if (! $this->userData->hasDefaultCover() && ! empty($this->userData->cover)) {
            Storage::disk(config('user.disks.cover'))->delete($this->userData->cover);
        }
        
        return $this->userData->delete();
    }

    private function deleteUserPublications() {
        $batchSize = 1000;

        Post::with(['media'])->where('user_id', $this->userData->id)->chunk($batchSize, function ($posts) {
            foreach ($posts as $post) {
                (new DeletePostAction($post))->execute();
            }
        });
    }

    private function deleteUserWallet() {
        // TODO: Implement this method.
    }

    private function deleteUserStories() {
        // TODO: Implement this method.
    }

    private function deleteUserProducts() {
        // TODO: Implement this method.
    }

    private function deleteUserAds() {
        // TODO: Implement this method.
    }

    private function deleteUserJobs() {
        // TODO: Implement this method.
    }

    private function deleteUserNotifications() {
        // TODO: Implement this method.
    }

    private function deleteUserDevices() {
        // TODO: Implement this method.
    }

    private function resetUserChildAccounts() {
        // TODO: Implement this method.
    }

    private function deleteUserPayments() {
        // TODO: Implement this method.
    }

    private function deleteUserComments() {
        // TODO: Implement this method.
    }

    private function deleteUserSocialAccounts() {
        // TODO: Implement this method.
    }
}
