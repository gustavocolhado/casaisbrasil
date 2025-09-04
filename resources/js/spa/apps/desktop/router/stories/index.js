import StoriesPage from '@D/views/stories/StoriesPage.vue';
import { Layouts } from '@D/core/constants/layouts.js';

export default {
    path: '/stories',
    component: StoriesPage,
    alias: '/stories',
    name: 'stories_page',
    redirect: { name: 'stories_index_page' },
    children: [
        {
            path: ':story_uuid',
            component: function() {
                return import('@D/views/stories/StoriesIndex.vue');
            },
            name: 'stories_index_page',
            meta: {
                layout: Layouts.STORIES,
                auth: true
            },
            props: true
        }
    ]
}