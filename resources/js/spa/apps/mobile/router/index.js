import { createRouter, createWebHistory } from 'vue-router';

import { Layouts } from '@M/core/constants/layouts.js';

const Router = createRouter({
	history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return { top: savedPosition.top };
        }
    },
	routes: [
		{
			path: '/',
			component: () => {
				return import('@M/views/home/HomePage.vue');
			},
			alias: '/home',
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'home_page'
		},
	]
});

export default Router;