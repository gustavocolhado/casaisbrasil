<template>
	<div class="block" v-if="state.isLoading">
		<JobCardSkeleton v-for="i in 3" v-bind:key="i"></JobCardSkeleton>
	</div>
	<div class="block" v-else>
		<div v-if="bookmarks.length">
			<div class="rounded-b-2xl overflow-hidden">
				<JobCard 
					v-for="jobItem in bookmarks"
					v-on:click="$router.push({ name: 'jobs_index', params: { job_id: jobItem.hash_id } })"
					v-bind:key="jobItem.id"
				v-bind:jobData="jobItem"></JobCard>
			</div>
		</div>
		<div v-else>
			<FluidEmptyState iconName="bookmark" v-bind:text="$t('empty_state.jobs.bookmarks')"></FluidEmptyState>
		</div>
	</div>
</template>

<script>
	import { defineComponent, reactive, computed, onMounted } from 'vue';
	import { useBookmarksStore } from '@D/store/bookmarks/bookmarks.store.js';

	import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
	import JobCard from '@D/views/jobs/children/jobsboard/parts/JobCard.vue';
	import JobCardSkeleton from '@D/views/jobs/children/jobsboard/parts/JobCardSkeleton.vue';

	export default defineComponent({
		setup: function() {
			const bookmarksStore = useBookmarksStore();
			const state = reactive({
				isLoading: true
			});

			bookmarksStore.resetBookmarks();

			const bookmarks = computed(() => {
				return bookmarksStore.bookmarks;
			});

			onMounted(async() => {
                state.isLoading = true;

                await bookmarksStore.fetchBookmarks({
                    type: 'jobs'
                });

               	state.isLoading = false;
            });

			return {
				state: state,
				bookmarks: bookmarks
			};
		},
		components: {
			FluidEmptyState: FluidEmptyState,
			JobCard: JobCard,
			JobCardSkeleton: JobCardSkeleton
		}
	});
</script>