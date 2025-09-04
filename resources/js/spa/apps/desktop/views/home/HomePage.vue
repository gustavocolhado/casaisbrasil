<template>
    <div class="my-top-offset block">
        <div class="mb-6">
            <PageTitle v-bind:hasBack="false" v-bind:titleText="$t('labels.hello_user', { name: userData.first_name })"></PageTitle>
        </div>

        <StoriesFeed></StoriesFeed>
        
        <div class="mt-1">
            <SidedContentLayout>
                <template v-slot:content>
                    <TimelineContainer>
                        <div class="block" v-if="state.isLoading">
                            <TimelinePublicationSkeleton v-for="i in 3" v-bind:key="i"></TimelinePublicationSkeleton>
                        </div>
                        <div class="block" v-else>
                            <div class="block">
                                <PublicationEditorTrigger></PublicationEditorTrigger>
                                <div class="h-px bg-bord-pr"></div>
                            </div>
                            
                            <div v-if="timelinePosts.length">
                                <TimelinePublication 
                                    v-for="postData in timelinePosts"
                                    v-bind:postData="postData"
                                    v-on:delete="handlePostDelete(postData)"
                                v-bind:key="postData.hash_id"></TimelinePublication>

                                <div v-if="state.isLoadingContent">
                                    <div class="flex justify-center my-4">
                                        <div class="colibri-primary-animation"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <div class="block py-72">
                                    <p class="text-lab-sc text-par-s text-center">
                                        Seems that there are no post yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TimelineContainer>
                </template>

                <template v-slot:sidebar>
                    <FollowRecommendationList></FollowRecommendationList>
        
                    <AdGridItem></AdGridItem>
                </template>
            </SidedContentLayout>
        </div>

        <ScrollTopButton></ScrollTopButton>
    </div>
</template>

<script>
    import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { useTimelineStore } from '@D/store/timeline/timeline.store.js';
    import { useDeletePost } from '@D/core/composables/delete-post/index.js';
    import { useInfiniteScroll } from '@D/core/composables/infinite-scroll/index.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';

    import StoriesFeed from '@D/components/stories/feed/StoriesFeed.vue';
    import TimelinePublication from '@D/components/timeline/feed/TimelinePublication.vue';
    import TimelinePublicationSkeleton from '@D/components/timeline/feed/TimelinePublicationSkeleton.vue';
    import PublicationEditorTrigger from '@D/features/home/parts/PublicationEditorTrigger.vue';
    import PageTitle from '@D/components/layout/PageTitle.vue';
    import TimelineContainer from '@D/components/timeline/feed/TimelineContainer.vue';
    import PrimaryPillButton from '@D/components/inter-ui/buttons/PrimaryPillButton.vue';
    import ScrollTopButton from '@D/components/inter-ui/buttons/ScrollTopButton.vue';
    import FollowRecommendationList from '@D/components/recommend/follow/list/FollowRecommendationList.vue';
    import AdGridItem from '@D/components/ads/AdGridItem.vue';
    import SidedContentLayout from '@D/components/layout/SidedContentLayout.vue';

    export default defineComponent({
        setup: function() {
            const state = reactive({
                isLoading: false,
                isLoadingContent: false,
                noMoreContent: false,
                filter: {
                    page: 1
                }
            });

            const { postDeleter } = useDeletePost();
            
            const authStore = useAuthStore();
            const timelineStore = useTimelineStore();
            const userData = ref(authStore.user);

            const timelinePosts = computed(() => {
                return timelineStore.posts;
            });

            onMounted(async () => {
                state.isLoading = true;

                await timelineStore.initialLoad();

                state.isLoading = false;
            });

            const loadMorePost = async () => {
				try {
					if(! state.isLoadingContent && ! state.noMoreContent && timelinePosts.value.length) {
						state.isLoadingContent = true;

						await timelineStore.loadNextPage().then(function(response) {
							let content = response.data.data;

							if(content.length) {
								timelineStore.appendPosts(content);
							}
							else{
								state.noMoreContent = true;
							}
						}).catch((error) => {
							if(error.response) {
								state.noMoreContent = true;
							}
						});

						state.isLoadingContent = false;
					}
				} catch (error) {
					console.log(error);
				}
			}

            useInfiniteScroll({
                callback: loadMorePost
            });

            return {
                timelinePosts: timelinePosts,
                userData: userData,
                state: state,
                handlePostDelete: (postData) => {
                    postDeleter(postData, (postId) => {
                        colibriEventBus.emit('timeline:post-deleted', postId);
                    });
                }
            };
        },
        components: {
            StoriesFeed: StoriesFeed,
            TimelinePublication: TimelinePublication,
            PublicationEditorTrigger: PublicationEditorTrigger,
            TimelinePublicationSkeleton: TimelinePublicationSkeleton,
            PageTitle: PageTitle,
            TimelineContainer: TimelineContainer,
            PrimaryPillButton: PrimaryPillButton,
            FollowRecommendationList: FollowRecommendationList,
            AdGridItem: AdGridItem,
            ScrollTopButton: ScrollTopButton,
            SidedContentLayout: SidedContentLayout
        }
    });
</script>