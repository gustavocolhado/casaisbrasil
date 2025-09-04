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

namespace App\Http\Controllers\Api\User\Timeline;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Enums\Post\PostStatus;
use App\Http\Controllers\Controller;
use App\Traits\Http\Api\SupportsApiResponses;
use App\Http\Resources\User\Timeline\TimelineResource;
use App\Http\Resources\User\Timeline\CommentCollection;
use App\Http\Resources\User\Timeline\TimelineCollection;
use App\Http\Resources\User\Overview\UserOverviewResource;

class FeedController extends Controller
{
    use SupportsApiResponses;

    public function getFeed()
    {
        $filter = request()->array('filter');

        $pageNumber = data_get_integer($filter, 'page', 1);

        $processingPosts = me()->posts()->where('status', PostStatus::PROCESSING_VIDEO)->get();

        $timelinePosts = Post::timelineFormatPosts()
            ->orderBy('created_at', 'desc')
            ->orderBy('comments_count', 'desc')
            ->orderBy('bookmarks_count', 'desc')
            ->orderBy('views_count', 'desc')
            ->orderBy('quotes_count', 'desc')
            ->simplePaginateManual(config('post.paginate_per'), $pageNumber);

        $timelinePosts = $processingPosts->merge($timelinePosts);
        
        return TimelineCollection::make($timelinePosts)->additional([
            'status' => 'success',
            'code' => 200
        ]);
    }

    public function getPostData(Request $request)
    {
        $postHashId = $request->route('hashId');

        $postData = Post::active()->whereHashId($postHashId)->timelineFormatPosts()->first();
        
        if($postData) {
            $postComments = $this->fetchPostItemComments($postData);

            return $this->responseSuccess([
                'data' => [
                    'author' => UserOverviewResource::make($postData->user),
                    'post' => TimelineResource::make($postData),
                    'comments' => CommentCollection::make($postComments),
                    'meta' => [
                        'comments_per_page' => config('post.comments.paginate_per')
                    ]
                ]
            ]);
        }

        else{
            return $this->responseResourceNotFoundError('Post', $postHashId);
        }
    }

    public function getPostComments(Request $request)
    {
        $postHashId = $request->route('hashId');
        $cursorId = $request->integer('cursor');

        $postData = Post::active()->whereHashId($postHashId)->first();

        if(empty($postData)) {
            return $this->responseResourceNotFoundError('Post', $postHashId);
        }

        $postComments = $this->fetchPostItemComments($postData, $cursorId);

        return $this->responseSuccess([
            'data' => CommentCollection::make($postComments)
        ]);
    }

    private function fetchPostItemComments(Post $postData, int|string $cursorId = 0)
    {
        $postComments = $postData->comments()->with([
            'post:id,user_id',
            'user:id,first_name,last_name,avatar,username',
            'reactions',
            'parent.user:id,first_name,last_name,username'
        ])->when($cursorId, function($query) use ($cursorId) {
            $query->where('id', '<', $cursorId);
        })->latest('id');

        return $postComments->take(config('post.comments.paginate_per'))->get();
    }
}
