<template>
    <div class="my-top-offset block">
        <div class="mb-6">
            <PageTitle v-bind:hasBack="true" v-bind:titleText="$t('labels.bookmarks')"></PageTitle>
        </div>
        <StoriesFeed></StoriesFeed>
        <ContentContainer>
            <div class="block px-4 pb-4 pt-10">
                <div class="flex justify-center">
                    <img class="size-24" v-bind:src="$asset('assets/icons/bookmark.png')" alt="Image">
                </div>
                <div class="block text-center">
                    <h3 class="text-title-3 text-lab-pr tracking-tight font-bold">
                        {{ $t('labels.bookmarks') }}
                    </h3>
                    <p class="text-par-s text-lab-sc">
                        {{ $t('labels.bookmarks_privacy_description') }}
                    </p>
                </div>
            </div>
            <ContentTabs>
                <TabsItem v-bind:link="{ name: 'bookmarks_posts_page' }">
                    {{ $t('labels.posts') }}
                </TabsItem>
                <TabsItem v-bind:link="{ name: 'bookmarks_jobs_page' }">
                    {{ $t('labels.jobs') }}
                </TabsItem>
                <TabsItem v-bind:link="{ name: 'bookmarks_products_page' }">
                    {{ $t('labels.products') }}
                </TabsItem>
            </ContentTabs>
            <div class="block border-t border-t-bord-pr">
                <RouterView></RouterView>
            </div>
        </ContentContainer>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    
    import PageTitle from '@D/components/layout/PageTitle.vue';
    import ContentContainer from '@D/components/layout/ContentContainer.vue';
    import StoriesFeed from '@D/components/stories/feed/StoriesFeed.vue';
    import ContentTabs from '@D/components/general/tabs/content/ContentTabs.vue';
    import TabsItem from '@D/components/general/tabs/content/parts/TabsItem.vue';

    export default defineComponent({
        components: {
            PageTitle: PageTitle,
            StoriesFeed: StoriesFeed,
            ContentTabs: ContentTabs,
            TabsItem: TabsItem,
            ContentContainer: ContentContainer
        }
    });
</script>