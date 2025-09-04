<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Enums\Post\PostType;
use App\Enums\Post\PostStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $posts = require(database_path('demo/data/posts.php'));

        foreach ($posts as $post) {
            $comments = $post['comments'];

            unset($post['comments']);

            $post['user_id'] = $this->getRandomUserId();
            $post['comments_count'] = count($comments);
            $post['status'] = PostStatus::ACTIVE;
            $post['type'] = PostType::TEXT;
            $post['text_language'] = 'en';
            $post['created_at'] = now()->subDays(rand(1, 100));
            $post['views_count'] = rand(100, 1000000);

            $postData = Post::create($post);

            foreach ($comments as $comment) {
                $postData->comments()->create([
                    'user_id' => $this->getRandomUserId(),
                    'content' => $comment['content'],
                ]);
            }
        }

        Schema::enableForeignKeyConstraints();
    }

    private function getRandomUserId()
    {
        return User::inRandomOrder()->first()->id;
    }
}
