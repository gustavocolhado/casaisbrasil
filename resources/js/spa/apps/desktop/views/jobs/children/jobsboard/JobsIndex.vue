<template>
    <div class="mb-4">
        <h3 class="text-lg-title text-lab-pr2 font-semibold text-center">
            {{ $t('job.jobs_title') }}
        </h3>
        <p class="text-lab-pr2 smoothing text-par-s font-normal text-center">
            {{ $t('job.jobs_description') }}
        </p>
    </div>
    <template v-if="state.isLoading">
        <div class="flex-center h-96">
            <PrimarySpinAnimation></PrimarySpinAnimation>
        </div>
    </template>
    <template v-else>
        <div class="mb-6 flex justify-center">
            <div class="w-content">
                <SearchBar v-model.trim="searchQuery" v-bind:placeholder="$t('job.search_job_placeholder')">
                    <template v-if="activeFiltersCount">
                        <button v-on:click="resetFilter" type="button" class="text-red-900 text-par-s">
                            {{ $t('market.reset_filters') }}
                        </button>
                    </template>
                </SearchBar>
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
                    {{ $t('job.saved_jobs_count', { count: bookmarksCount }) }}
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
                    <template v-if="jobs.length">
                        <div class="flex gap-4">
                            <div class="w-6/12 lg:w-content">
                                <JobCard 
                                    v-on:click="showJob(jobItem)" v-for="jobItem in jobs"
                                    v-bind:key="jobItem.id"
                                    v-bind:isActive="(jobData && jobItem.id == jobData.id)"
                                v-bind:jobData="jobItem"></JobCard>

                                <div v-if="state.isLoadingContent">
                                    <div class="flex justify-center my-4">
                                        <div class="colibri-primary-animation"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="jobData" class="w-6/12 lg:flex-1">
                                <JobOverview v-bind:jobData="jobData" v-bind:key="jobData.id"></JobOverview>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <FluidEmptyState v-bind:text="$t('empty_state.jobs.filter')" iconType="solid"></FluidEmptyState>
                    </template>
                </template>
            </template>
        </CatalogContainer>
    </template>
</template>

<script>
    import { defineComponent, ref, onMounted, watch, computed, reactive } from 'vue';
    import { useRouter } from 'vue-router';
    import { useInfiniteScroll } from '@D/core/composables/infinite-scroll/index.js';
    import { useJobsStore } from '@D/store/jobs/jobs.store.js';

    import JobCard from '@D/views/jobs/children/jobsboard/parts/JobCard.vue';
    import JobOverview from '@D/views/jobs/children/jobsboard/parts/JobOverview.vue';
    import SearchBar from '@D/components/general/search/SearchBar.vue';
    import CategoriesFilter from '@D/components/general/search/CategoriesFilter.vue';
    import PrimaryPillButton from '@D/components/inter-ui/buttons/PrimaryPillButton.vue';
    import AvatarRightSided from '@D/components/general/avatars/sided/small/AvatarRightSided.vue';
    import DropdownButton from '@D/components/general/dropdowns/parts/DropdownButton.vue';
    import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
    import CatalogContainer from '@D/components/layout/CatalogContainer.vue';

    export default defineComponent({
        props: {
            job_id: {
                type: String,
                required: false
            }
        },
        setup: function(props) {
            const state = reactive({
                isLoading: true,
                isSearchLoading: false,
                noMoreContent: false,
                isLoadingContent: false,
                isEmpty: false
            });

            const selectedCategory = ref(null);
            const router = useRouter();
            const searchQuery = ref('');
            const jobsStore = useJobsStore();
            const jobs = computed(() => {
                return jobsStore.jobs;
            });

            const jobData = computed(() => {
                return jobsStore.job;
            })
            
            const categories = computed(() => {
                return jobsStore.categories;
            });

            const filter = computed(() => {
                return jobsStore.filter;
            });

            const loadJob = async function(id) {
                await jobsStore.fetchJob(id);
            }

            watch(searchQuery, () => {
                jobsStore.filter.query = searchQuery.value;

                debounce(async () => {
                    await applyFilters();
                }, 500);
            });

            const applyFilters = async function() {
                state.noMoreContent = false;
                jobsStore.filter.cursor = null;

                state.isSearchLoading = true;
                await jobsStore.fetchJobs();
                state.isSearchLoading = false;

                selectDefaultJob();
            }

            const activeFiltersCount = computed(() => {
                return jobsStore.activeFiltersCount;
            });

            const selectDefaultJob = function() {
                if(jobs.value.length > 0) {
                    jobsStore.job = jobs.value[0];
                }
            }

            useInfiniteScroll({
				callback: () => {
                    debounce(async () => {
                        if(! state.isLoadingContent && ! state.noMoreContent && jobs.value.length) {
                            state.isLoadingContent = true;

                            jobsStore.filter.cursor = jobsStore.getLastJobId();

                            state.noMoreContent = ! await jobsStore.loadMoreJobs();

                            state.isLoadingContent = false;
                        }
                    }, 200);
                }
			});

            onMounted(async function() {
                jobsStore.resetFilter();
                await jobsStore.fetchCategories();
                await jobsStore.fetchJobs();
                await jobsStore.fetchBookmarkedJobsCount();

                debounce(() => {
                    if(! jobs.value.length) {
                        state.isEmpty = true;
                    }
                }, 500);
                
                if(props.job_id) {
                    await loadJob(props.job_id);
                }
                else {
                    selectDefaultJob();
                }

                state.isLoading = false;
            });

            return {
                jobData: jobData,
                jobs: jobs,
                filter: filter,
                state: state,
                searchQuery: searchQuery,
                activeFiltersCount: activeFiltersCount,
                bookmarksCount: computed(() => {
                    return jobsStore.bookmarksCount;
                }),
                categories: categories,
                selectedCategory: selectedCategory,
                resetFilter: async () => {
                    jobsStore.resetFilter();
                    searchQuery.value = '';
                    selectedCategory.value = null;

                    state.isLoading = true;
                    await jobsStore.fetchJobs();
                    state.isLoading = false;
                },
                selectCategory: (categoryItem) => {
                    if(jobsStore.filter.category_id == categoryItem.id) {
                        jobsStore.filter.category_id = null;
                        selectedCategory.value = null;
                    }
                    else {
                        jobsStore.filter.category_id = categoryItem.id;
                        selectedCategory.value = categoryItem;
                    }

                    applyFilters();
                },
                showJob: async function(jobData) {
                    router.push({
                        name: 'jobs_index',
                        params: {
                            job_id: jobData.hash_id
                        }
                    });

                    jobsStore.job = jobData;
                }
            };
        },
        components: {
            SearchBar: SearchBar,
            JobCard: JobCard,
            JobOverview: JobOverview,
            CategoriesFilter: CategoriesFilter,
            AvatarRightSided: AvatarRightSided,
            PrimaryPillButton: PrimaryPillButton,
            DropdownButton: DropdownButton,
            FluidEmptyState: FluidEmptyState,
            CatalogContainer: CatalogContainer
        }
    });
</script>