<template>
	<div v-if="followRecommendations.length" class="block mb-4">
		<div class="block border border-bord-pr rounded-2xl">
			<template v-if="state.isLoading">
				<div class="flex justify-center py-8">
					<PrimarySpinAnimation></PrimarySpinAnimation>
				</div>
			</template>
			<template v-else>
				<div class="flex justify-between text-par-n px-4 py-3">
					<h5 class="text-lab-pr2 font-semibold">
						{{ $t('labels.recommendations') }}
					</h5>
					<RouterLink v-bind:to="{ name: 'explore_people_page' }" class="text-brand-900 cursor-pointer">
						{{ $t('labels.all') }}
					</RouterLink>
				</div>
				<div class="pb-2">
					<FollowListItem v-for="userData in followRecommendations" v-bind:key="userData.id" v-bind:userData="userData"></FollowListItem> 
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import { defineComponent, reactive, onMounted, computed } from 'vue';
	import { useRecommendStore } from '@D/store/recommend/recommend.store.js';

	import FollowListItem from '@D/components/recommend/follow/list/FollowListItem.vue';
	
	export default defineComponent({
		setup: function(props, context) {
			const recommendStore = useRecommendStore();

			const state = reactive({
				isLoading: true
			});

			const followRecommendations = computed(() => {
				return recommendStore.followRecommendations;
			});

			onMounted(async () => {
				await recommendStore.fetchFollowRecommendations();

				state.isLoading = false;
			});

			return {
				state: state,
				followRecommendations: followRecommendations,
			};
		},
		components: {
			FollowListItem: FollowListItem
		}
	});
</script>