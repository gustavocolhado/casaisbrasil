import { defineStore } from 'pinia';
import { colibriAPI } from '@/kernel/services/api-client/native/index.js';

const useTimelineStore = defineStore('timeline_store', {
    deleteAware: true,
    state: function() {
		return {
			posts: [],
			filter: {
				page: 1
			}
		}
	},
    actions: {
        initialLoad: async function() {
            let state = this;

            if (! state.posts.length) {
                this.load().then(function(response) {
                    state.posts = response.data.data;
                }).catch(function(error) {
                    state.posts = [];
                });
            }
        },
        loadNextPage: async function() {
            this.filter.page += 1;

            return await this.load();
        },
        load: async function() {
            return await colibriAPI().userTimeline().params({
                filter: this.filter
            }).getFrom('feed');
        },
        appendPosts: function(posts) {
            this.posts = this.posts.concat(posts);
        },
        prependPost: function(postData) {
            this.posts.unshift(postData);

            return this.posts;
        },
        removePost: function(postId) {
            let postIndex = this.posts.findIndex((item) => {
                return item.id == postId;
            });

            if(postIndex !== -1) {
                this.posts.splice(postIndex, 1);
            }
        },
        setPostMedia: function(mediaData) {
            const postItem = this.posts.find((item) => {
                return item.id == mediaData.post_id;
            });

            if(postItem?.relations?.media?.length) {
                let mediaIndex = postItem.relations.media.findIndex((item) => {
                    return item.id == mediaData.id;
                });

                if(mediaIndex !== -1) {
                    postItem.relations.media[mediaIndex] = mediaData;
                }
            }
        },
        setPostPollData: function(pollData) {
            const postItem = this.posts.find((item) => {
                return item.id == pollData.post_id;
            });

            if(postItem?.relations?.poll) {
                postItem.relations.poll = pollData;
            }
        }
    }
});

export { useTimelineStore };