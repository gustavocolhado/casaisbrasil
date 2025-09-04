<template>
    <div class="mb-4">
        <h3 class="text-lg-title text-lab-pr2 font-semibold text-center">
            {{ $t('market.market_title') }}
        </h3>
        <p class="text-lab-pr2 smoothing text-par-s font-normal text-center">
            {{ $t('market.market_description') }}
        </p>
    </div>

    <template v-if="state.isLoading">
        <div class="flex-center h-96">
            <PrimarySpinAnimation></PrimarySpinAnimation>
        </div>
    </template>
    <template v-else>
        <div class="mb-6 flex justify-center items-center gap-2 translate-x-6">
            <div class="w-content">
                <SearchBar v-model.trim="searchQuery" v-bind:placeholder="$t('market.search_product_placeholder')">
                    <!-- <div class="shrink-0">
                        <button  type="button" class="flex smoothing items-center gap-1 text-lab-pr2 hover:text-lab-pr">
                            <span class="text-par-s font-normal">
                                {{ $t('market.product_filter_label') }} {{ (activeFiltersCount) ? `(${activeFiltersCount})` : '' }}
                            </span>
                            <span class="shrink-0">
                                <SvgIcon type="solid" name="chevron-down" classes="size-icon-x-small"></SvgIcon>
                            </span>
                        </button>
                    </div>
                    <template v-if="activeFiltersCount">
                        <div class="h-4 w-px bg-edge-pr leading-4"></div>
                        <div class="shrink-0">
                            <button v-on:click="resetFilter" type="button" class="text-red-900 text-par-s">
                                {{ $t('market.reset_filters') }}
                            </button>
                        </div>
                    </template> -->

                    <template v-if="activeFiltersCount">
                        <button v-on:click="resetFilter" type="button" class="text-red-900 text-par-s">
                            {{ $t('market.reset_filters') }}
                        </button>
                    </template>
                </SearchBar>
            </div>
            <div class="shrink-0">
                <button v-on:click="toggleFilter" type="button" class="relative size-14 rounded-full text-lab-pr2 inline-flex-center cursor-pointer">
                    <span class="size-icon-normal">
                        <SvgIcon type="solid" name="filter-funnel-01"></SvgIcon>
                    </span>
                    <span class="absolute top-1 right-2">
                        <BadgeCounter v-if="activeFiltersCount" v-bind:count="activeFiltersCount"></BadgeCounter>
                    </span>
                </button>
            </div>
        </div>
        <div class="mb-6">
            <Border></Border>
        </div>
        <CatalogContainer>
            <div class="mb-6">
                <CategoriesFilter 
                    v-on:select="selectCategory"
                    v-bind:selected="filter.category_id"
                v-bind:categories="categories"></CategoriesFilter>
            </div>
            <div class="mb-4 flex justify-between items-end">
                <h4 class="text-title-3 text-lab-pr2 font-semibold">
                    {{ selectedCategory ? selectedCategory.name : $t('labels.recommendations') }}
                </h4>

                <div v-if="bookmarksCount" class="text-lab-pr2 smoothing text-par-s font-normal">
                    {{ $t('market.saved_products_count', { count: bookmarksCount }) }}
                </div>
            </div>
    
            <template v-if="state.isEmpty">
                <FluidEmptyState v-bind:text="$t('empty_state.empty')" iconType="solid"></FluidEmptyState>
            </template>
            <template v-else>
                <template v-if="state.isSearchLoading">
                    <div class="flex-center h-96">
                        <PrimarySpinAnimation></PrimarySpinAnimation>
                    </div>
                </template>
                <template v-else>
                    <template v-if="products.length">
                        <div class="grid grid-cols-4 2xl:grid-cols-5 gap-4">
                            <ProductCard v-for="productData in products"
                                v-bind:productData="productData"
                            v-on:click="showProduct(productData.id)"></ProductCard>
                        </div>
                    </template>
                    <template v-else>
                        <FluidEmptyState v-bind:text="$t('empty_state.market.filter')" iconType="solid"></FluidEmptyState>
                    </template>
                </template>
            </template>
        </CatalogContainer>
    </template>

    <template v-if="state.openFilter">
        <FilterModal v-on:close="toggleFilter">
            <ProductsFilter></ProductsFilter>

            <template v-slot:fixedFooter>
                <div class="block px-4 py-4 border-t border-t-bord-pr">
                    <PrimaryPillButton v-on:click="applyFilters" v-bind:buttonFluid="true" buttonSize="lm" width="full" v-bind:buttonText="$t('market.apply_filters')"></PrimaryPillButton>
                </div>
            </template>
        </FilterModal>
    </template>

    <ItemModal></ItemModal>
</template>

<script>
    import { defineComponent, watch, ref, reactive, onMounted, computed, onUnmounted } from 'vue';
    import { useMarketStore } from '@D/store/market/market.store.js';
    import { useInfiniteScroll } from '@D/core/composables/infinite-scroll/index.js';

    import CatalogContainer from '@D/components/layout/CatalogContainer.vue';
    import ProductCard from '@D/views/marketplace/children/marketplace/parts/ProductCard.vue';
    import CategoriesFilter from '@D/components/general/search/CategoriesFilter.vue';
    import SearchBar from '@D/components/general/search/SearchBar.vue';
    import FilterModal from '@D/components/general/modals/FilterModal.vue';
    import ProductsFilter from '@D/views/marketplace/children/marketplace/parts/ProductsFilter.vue';
    import PrimaryPillButton from '@D/components/inter-ui/buttons/PrimaryPillButton.vue';
    import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
    import BadgeCounter from '@D/components/general/counters/BadgeCounter.vue';
    import ItemModal from '@D/views/marketplace/children/marketplace/modals/ItemModal.vue';

    export default defineComponent({
        setup: function() {
            const state = reactive({
                isLoading: true,
                isSearchLoading: false,
                noMoreContent: false,
                isLoadingContent: false,
                openFilter: false,
                isEmpty: false
            });
            
            const selectedCategory = ref(null);
            const searchQuery = ref(null);
            const marketStore = useMarketStore();
            const categories = computed(() => {
                return marketStore.categories;
            });

            const filter = computed(() => {
                return marketStore.filter;
            });

            const products = computed(() => {
                return marketStore.products;
            });
            
            onMounted(async () => {
                marketStore.resetFilter();
                await marketStore.fetchCategories();
                await marketStore.fetchProducts();
                await marketStore.fetchMetadata();
                
                marketStore.fetchBookmarkedProductsCount();

                debounce(() => {
                    if(! products.value.length) {
                        state.isEmpty = true;
                    }
                }, 500);

                state.isLoading = false;
            });

            onUnmounted(() => {
                marketStore.product = null;
            });

            useInfiniteScroll({
				callback: () => {
                    debounce(async () => {
                        if(! state.isLoadingContent && ! state.noMoreContent && products.value.length) {
                            state.isLoadingContent = true;

                            marketStore.filter.cursor = marketStore.getLastProductId();

                            state.noMoreContent = ! await marketStore.loadMoreProducts();

                            state.isLoadingContent = false;
                        }
                    }, 200);
                }
			});

            watch(searchQuery, () => {
                marketStore.filter.query = searchQuery.value;

                debounce(async () => {
                    await applyFilters();
                }, 500);
            });

            const closeFilter = () => {
                state.openFilter = false;

                document.body.classList.remove('overflow-hidden');
            }

            const openFilter = () => {
                state.openFilter = true;

                document.body.classList.add('overflow-hidden');
            }

            const toggleFilter = () => {
                if(state.openFilter == false) {
                    openFilter();
                    
                }
                else{
                    closeFilter();
                }
            }

            const applyFilters = async () => {
                closeFilter();

                state.noMoreContent = false;
                marketStore.filter.cursor = null;

                state.isSearchLoading = true;
                await marketStore.fetchProducts();
                state.isSearchLoading = false;
            };

            const activeFiltersCount = computed(() => {
                return marketStore.activeFiltersCount;
            });

            return {
                activeFiltersCount: activeFiltersCount,
                searchQuery: searchQuery,
                state: state,
                filter: filter,
                products: products,
                categories: categories,
                applyFilters: applyFilters,
                selectedCategory: selectedCategory,
                selectCategory: (categoryItem) => {
                    if(marketStore.filter.category_id == categoryItem.id) {
                        marketStore.filter.category_id = null;
                        selectedCategory.value = null;
                    }
                    else {
                        marketStore.filter.category_id = categoryItem.id;
                        selectedCategory.value = categoryItem;
                    }

                    applyFilters();
                },
                toggleFilter: toggleFilter,
                resetFilter: async () => {
                    marketStore.resetFilter();
                    searchQuery.value = '';
                    selectedCategory.value = null;

                    state.isLoading = true;
                    await marketStore.fetchProducts();
                    state.isLoading = false;
                },
                bookmarksCount: computed(() => {
                    return marketStore.bookmarksCount;
                }),
                showProduct: async (id) => {
                    await marketStore.fetchProduct(id);
                }
            };
        },
        components: {
            PrimaryPillButton: PrimaryPillButton,
            ProductCard: ProductCard,
            CategoriesFilter: CategoriesFilter,
            SearchBar: SearchBar,
            FilterModal: FilterModal,
            ProductsFilter: ProductsFilter,
            FluidEmptyState: FluidEmptyState,
            CatalogContainer: CatalogContainer,
            BadgeCounter: BadgeCounter,
            ItemModal: ItemModal
        }
    });
</script>