<template>
	<div class="block" v-if="state.isLoading">
		<TimelinePublicationSkeleton v-for="i in 3" v-bind:key="i"></TimelinePublicationSkeleton>
	</div>
	<div class="block" v-else>
		<div v-if="bookmarks.length">
			<TimelinePublication v-for="postData in bookmarks" v-bind:postData="postData" v-bind:key="postData.id"></TimelinePublication>
		</div>
		<div v-else>
			<FluidEmptyState iconName="bookmark" v-bind:text="$t('empty_state.post_bookmarks')"></FluidEmptyState>
		</div>
	</div>
</template>

<script>
	import { defineComponent, reactive, onMounted, computed } from 'vue';
	import { useBookmarksStore } from '@D/store/bookmarks/bookmarks.store.js';

	import TimelinePublication from '@D/components/timeline/feed/TimelinePublication.vue';
    import TimelinePublicationSkeleton from '@D/components/timeline/feed/TimelinePublicationSkeleton.vue';
    import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';

	export default defineComponent({
		setup: function() {
			const bookmarksStore = useBookmarksStore();
			const state = reactive({
				isLoading: false
			});

			bookmarksStore.resetBookmarks();
			
			const bookmarks = computed(() => {
				return bookmarksStore.bookmarks;
			});

            onMounted(async() => {
                state.isLoading = true;

                await bookmarksStore.fetchBookmarks({
                    type: 'posts'
                });

                state.isLoading = false;
            });

			return {
				state: state,
				bookmarks: bookmarks
			};
		},
		components: {
			TimelinePublication: TimelinePublication,
			TimelinePublicationSkeleton: TimelinePublicationSkeleton,
			FluidEmptyState: FluidEmptyState
		}
	});
</script>