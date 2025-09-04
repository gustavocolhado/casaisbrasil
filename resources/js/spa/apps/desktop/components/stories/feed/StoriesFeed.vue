<template>
    <div class="flex max-w-full gap-2 mb-10">
        <div v-on:click="createStory" class="size-medium-avatar cursor-pointer">
            <div class="rounded-full overflow-hidden mb-1 inline-flex-center size-medium-avatar bg-fill-tr">
                <SvgIcon name="plus" classes="size-6 text-brand-900"></SvgIcon>
            </div>
            <div class="text-cap-l text-lab-pr text-center whitespace-nowrap overflow-hidden text-ellipsis">
                {{ $t('labels.new_story') }}
            </div>
        </div>
        <template v-if="storiesFeed.length">
            <RouterLink v-for="storyData in storiesFeed" v-bind:to="{ name: 'stories_index_page', params: { story_uuid: storyData.story_uuid } }">
                <div class="size-medium-avatar">
                    <div class="rounded-full story-avatar overflow-hidden mb-1 ring-2" v-bind:class="[(storyData.is_owner || storyData.is_seen) ? 'ring-edge-sc' : 'ring-red-900']">
                        <img class="size-medium-avatar inline-block bg-fill-pr" v-bind:src="storyData.relations.user.avatar_url" alt="Image">
                    </div>
                    <div class="text-cap-l text-lab-pr text-center whitespace-nowrap overflow-hidden text-ellipsis">
                        {{ storyData.relations.user.name }}
                    </div>
                </div>
            </RouterLink>
        </template>
    </div>
</template>

<script>
    import { computed, defineComponent, onMounted } from 'vue';
    import { useStoriesEditorStore } from '@D/store/stories/editor.store.js';
    import { useStoriesStore } from '@D/store/stories/stories.store.js';

    import AvatarMedium from '@D/components/general/avatars/AvatarMedium.vue';

    export default defineComponent({
        setup: function() {
            const storiesEditorStore = useStoriesEditorStore();
            const storiesStore = useStoriesStore();

            onMounted(async () => {
                try {
                    await storiesStore.fetchStoriesFeed();
                } catch (error) {
                    /* Pass */
                }
            });

            const storiesFeed = computed(() => {
                return storiesStore.storiesFeed;
            });

            return {
                storiesFeed: storiesFeed,
                createStory: () => {
                    storiesEditorStore.openEditor();
                }
            };
        },
        components: {
            AvatarMedium: AvatarMedium
        }
    });
</script>