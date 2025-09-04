<template>
	<div class="block" v-if="state.isLoading">
		<ProductBookmarkSkeleton v-for="i in 3" v-bind:key="i"></ProductBookmarkSkeleton>
	</div>
	<div class="block" v-else>
		<div v-if="bookmarks.length">
			<div class="rounded-b-2xl overflow-hidden">
				<ProductBookmarkItem
					v-for="productData in bookmarks"
					v-on:click="$router.push({ name: 'product_show_page', params: { id: productData.id } })"
					v-bind:productData="productData"
				v-bind:key="productData.id"></ProductBookmarkItem>
			</div>
		</div>
		<div v-else>
			<FluidEmptyState iconName="bookmark" v-bind:text="$t('empty_state.market.bookmarks')"></FluidEmptyState>
		</div>
	</div>
</template>

<script>
	import { defineComponent, reactive, computed, onMounted } from 'vue';
	import { useBookmarksStore } from '@D/store/bookmarks/bookmarks.store.js';

	import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
	import ProductBookmarkItem from '@D/views/bookmarks/children/products/parts/ProductBookmarkItem.vue';
	import ProductBookmarkSkeleton from '@D/views/bookmarks/children/products/parts/ProductBookmarkSkeleton.vue';

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
                    type: 'products'
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
			ProductBookmarkItem: ProductBookmarkItem,
			ProductBookmarkSkeleton: ProductBookmarkSkeleton
		}
	});
</script>