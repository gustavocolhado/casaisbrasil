<template>
	<div class="my-top-offset block">
        <div class="mb-6">
            <PageTitle v-bind:hasBack="true" v-bind:titleText="$t('labels.people')"></PageTitle>
        </div>
		<ContentContainer>
			<div class="px-3 border-b border-b-bord-pr py-3">
				<QuickSearch v-on:cancelsearch="handleSearchCancel" v-model.lazy="peopleSearchQuery" v-bind:placeholder="$t('chat.search')"></QuickSearch>
			</div>
			<template v-if="state.isLoading">
				<PeopleListItemSkeleton v-for="i in 15" v-bind:key="i"></PeopleListItemSkeleton>
			</template>
			<template v-else-if="state.isEmpty">
				<FluidEmptyState v-bind:text="$t('empty_state.empty')" iconName="users-03" iconType="line"></FluidEmptyState>
			</template>
			<template v-else>
				<template v-if="state.isSearchLoading">
					<PeopleListItemSkeleton v-for="i in 15" v-bind:key="i"></PeopleListItemSkeleton>
				</template>

				<div v-else class="block">
					<PeopleListItem v-if="people.length" v-for="userData in people" v-bind:key="userData.id" v-bind:userData="userData"></PeopleListItem>

					<FluidEmptyState v-else v-bind:text="$t('empty_state.explore.people.filter')" iconName="search-lg" iconType="solid"></FluidEmptyState>
				</div>

				<InfinityScrollContentLoader v-if="state.isLoadingContent"></InfinityScrollContentLoader>
			</template>
		</ContentContainer>
	</div>
</template>

<script>
	import { defineComponent, reactive, onMounted, ref, watch, computed } from 'vue';
	import { useExplorePeopleStore } from '@D/store/explore/people.store.js';
	import { useInfiniteScroll } from '@D/core/composables/infinite-scroll/index.js';

	import ContentContainer from '@D/components/layout/ContentContainer.vue';
	import PageTitle from '@D/components/layout/PageTitle.vue';
	import PeopleListItem from '@D/components/people/PeopleListItem.vue';
	import PeopleListItemSkeleton from '@D/components/people/PeopleListItemSkeleton.vue';
	import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
	import QuickSearch from '@D/components/general/search/QuickSearch.vue';
	import InfinityScrollContentLoader from '@D/components/loaders/InfinityScrollContentLoader.vue';

	export default defineComponent({
		setup: function() {
			const peopleSearchQuery = ref('');
			
			const state = reactive({
				noMoreContent: false,
                isLoadingContent: false,
				isEmpty: false,
				isLoading: true,
				isSearchLoading: false
			});

			const people = computed(() => {
				return explorePeopleStore.people;
			});

			const explorePeopleStore = useExplorePeopleStore();

			onMounted(async () => {
				await explorePeopleStore.fetchPeople();

				debounce(() => {
                    if(! people.value.length) {
                        state.isEmpty = true;
                    }
                }, 500);

                state.isLoading = false;
			});

			watch(peopleSearchQuery, () => {
                explorePeopleStore.filter.query = peopleSearchQuery.value;

                debounce(async () => {
                    await applyFilters();
                }, 500);
            });

			const applyFilters = async () => {
				explorePeopleStore.filter.page = 1;
				state.noMoreContent = false;
				state.isSearchLoading = true;
				await explorePeopleStore.fetchPeople();
				state.isSearchLoading = false;
			}

			useInfiniteScroll({
				callback: () => {
					debounce(async () => {
                        if(! state.isLoadingContent && ! state.noMoreContent && people.value.length) {
                            state.isLoadingContent = true;

                            explorePeopleStore.filter.page += 1;

                            state.noMoreContent = (! await explorePeopleStore.loadMorePeople());

                            state.isLoadingContent = false;
                        }
                    }, 200);
				}
			});

			return {
				people: people,
				state: state,
				peopleSearchQuery: peopleSearchQuery,
				handleSearchCancel: () => {
					peopleSearchQuery.value = '';
				}
			};
		},
		components: {
			ContentContainer: ContentContainer,
			PeopleListItem: PeopleListItem,
			PageTitle: PageTitle,
			FluidEmptyState: FluidEmptyState,
			PeopleListItemSkeleton: PeopleListItemSkeleton,
			QuickSearch: QuickSearch,
			InfinityScrollContentLoader: InfinityScrollContentLoader
		}
	});
</script>