import { createRouter, createWebHistory } from 'vue-router';
import { Layouts } from '@D/core/constants/layouts.js';

import HomePage from '@D/views/home/HomePage.vue';
import ProfilePage from '@D/views/profile/ProfilePage.vue';
import PublicationPage from '@D/views/publication/PublicationPage.vue';
import SettingsPage from '@D/views/settings/SettingsPage.vue';

import MessengerPage from '@D/views/messenger/MessengerPage.vue';
import MarketplacePage from '@D/views/marketplace/MarketplacePage.vue';
import JobsPage from '@D/views/jobs/JobsPage.vue';
import Error404Page from '@D/views/errors/err404/Error404Page.vue';

import WalletRoutes from '@D/router/wallet/index.js';
import StoryRoutes from '@D/router/stories/index.js';

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
			component: HomePage,
			alias: '/home',
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'home_page'
		},
        {
			path: '/jobs',
			component: JobsPage,
			alias: '/jobs',
            meta: {
                layout: Layouts.CATALOG,
                auth: true,
                feature: 'jobs',
                fluidLayout: true
            },
            name: 'jobs_page',
            redirect: { name: 'jobs_index' },
            children: [
                {
                    path: ':job_id?',
                    component: function() {
                        return import('@D/views/jobs/children/jobsboard/JobsIndex.vue');
                    },
                    name: 'jobs_index',
                    props: true
                }
            ]
		},
        {
			path: '/marketplace',
			component: MarketplacePage,
			alias: '/marketplace',
            meta: {
                layout: Layouts.CATALOG,
                auth: true,
                feature: 'marketplace',
                fluidLayout: true
            },
            name: 'marketplace_page',
            redirect: { name: 'marketplace_index' },
            children: [
                {
                    path: 'index',
                    component: function() {
                        return import('@D/views/marketplace/children/marketplace/MarketplaceIndex.vue');
                    },
                    name: 'marketplace_index',
                    props: true
                }
            ]
		},
        {
			path: '/messenger',
			component: MessengerPage,
			alias: '/messenger',
            meta: {
                contextNavbar: true,
                sectionName: 'messenger',
                layout: Layouts.MAIN,
                auth: true,
                fluidLayout: true
            },
            name: 'messenger_page',
            redirect: { 
                name: 'messenger_inbox'
            },
            children: [
                {
                    path: 'inbox',
                    component: function() {
                        return import('@D/views/messenger/children/inbox/MessengerInboxPage.vue');
                    },
                    name: 'messenger_inbox'
                },
                {
                    path: 'direct/:chat_id',
                    component: function() {
                        return import('@D/views/messenger/children/chat/MessengerChatPage.vue');
                    },
                    name: 'messenger_chat_page'
                }
            ]
		},
        {
			path: '/settings',
			component: SettingsPage,
			alias: '/settings',
            meta: {
                contextNavbar: true,
                sectionName: 'settings',
                layout: Layouts.MAIN,
                auth: true,
                rightOffset: true
            },
            name: 'settings_page',
            redirect: { name: 'account_settings_page' },
            children: [
                {
                    path: 'account_settings',
                    component: function() {
                        return import('@D/views/settings/children/account/AccountSettingsPage.vue');
                    },
                    name: 'account_settings_page'
                },
                {
                    path: 'account_credentials',
                    component: function() {
                        return import('@D/views/settings/children/navigators/credentials/CredentialsSettingsPage.vue');
                    },
                    name: 'account_credentials_page'
                },
                {
                    path: 'email',
                    component: function() {
                        return import('@D/views/settings/children/email/EmailSettingsPage.vue');
                    },
                    name: 'email_settings_page'
                },
                {
                    path: 'confirm_email',
                    component: function() {
                        return import('@D/views/settings/children/confirm_email/ConfirmEmailSettingsPage.vue');
                    },
                    name: 'confirm_email_settings_page'
                },
                {
                    path: 'phone',
                    component: function() {
                        return import('@D/views/settings/children/phone/PhoneSettingsPage.vue');
                    },
                    name: 'phone_settings_page'
                },
                {
                    path: 'confirm_phone',
                    component: function() {
                        return import('@D/views/settings/children/confirm_phone/ConfirmPhoneSettingsPage.vue');
                    },
                    name: 'confirm_phone_settings_page'
                },
                {
                    path: 'password',
                    component: function() {
                        return import('@D/views/settings/children/password/PasswordSettingsPage.vue');
                    },
                    name: 'password_settings_page'
                },
                {
                    path: 'notifications',
                    component: function() {
                        return import('@D/views/settings/children/navigators/notifications/NotificationsSettingsPage.vue');
                    },
                    name: 'notifications_settings_page'
                },
                {
                    path: 'push_notifications',
                    component: function() {
                        return import('@D/views/settings/children/push_notifications/PushNotificationsSettingsPage.vue');
                    },
                    name: 'push_notifications_settings_page'
                },
                {
                    path: 'email_notifications',
                    component: function() {
                        return import('@D/views/settings/children/email_notifications/EmailNotificationsSettingsPage.vue');
                    },
                    name: 'email_notifications_settings_page'
                },
                {
                    path: 'account_privacy',
                    component: function() {
                        return import('@D/views/settings/children/account_privacy/AccountPrivacySettingsPage.vue');
                    },
                    name: 'account_privacy_settings_page'
                },
                {
                    path: 'language',
                    component: function() {
                        return import('@D/views/settings/children/language/LanguageSettingsPage.vue');
                    },
                    name: 'language_settings_page'
                },
                {
                    path: 'social_media',
                    component: function() {
                        return import('@D/views/settings/children/social_media/SocialMediaSettingsPage.vue');
                    },
                    name: 'social_media_settings_page'
                },
                {
                    path: 'theme',
                    component: function() {
                        return import('@D/views/settings/children/theme/ThemeSettingsPage.vue');
                    },
                    name: 'theme_settings_page'
                },
                {
                    path: 'personal_info',
                    component: function() {
                        return import('@D/views/settings/children/navigators/personal_info/PersonalInfoSettingsPage.vue');
                    },
                    name: 'personal_info_settings_page'
                },
                {
                    path: 'birthdate',
                    component: function() {
                        return import('@D/views/settings/children/birthdate/BirthdateSettingsPage.vue');
                    },
                    name: 'birthdate_settings_page'
                },
                {
                    path: 'city',
                    component: function() {
                        return import('@D/views/settings/children/city/CitySettingsPage.vue');
                    },
                    name: 'city_settings_page'
                },
                {
                    path: 'country',
                    component: function() {
                        return import('@D/views/settings/children/country/CountrySettingsPage.vue');
                    },
                    name: 'country_settings_page'
                },
                {
                    path: 'verification',
                    component: function() {
                        return import('@D/views/settings/children/verification/VerificationPage.vue');
                    },
                    name: 'verification_page'
                },
                {
                    path: 'sessions',
                    component: function() {
                        return import('@D/views/settings/children/sessions/SessionsPage.vue');
                    },
                    name: 'sessions_settings_page'
                },
                {
                    path: 'blocked',
                    component: function() {
                        return import('@D/views/settings/children/blocked/BlockedPeoplePage.vue');
                    },
                    name: 'blocked_settings_page'
                },
                {
                    path: 'account-actions',
                    component: function() {
                        return import('@D/views/settings/children/actions/ActionsSettingsPage.vue');
                    },
                    name: 'actions_settings_page'
                },
                {
                    path: 'hotkeys',
                    component: function() {
                        return import('@D/views/settings/children/hotkeys/HotkeysSettingsPage.vue');
                    },
                    name: 'hotkey_settings_page'
                },
                {
                    path: 'api',
                    component: function() {
                        return import('@D/views/settings/children/api/ApiSettingsPage.vue');
                    },
                    name: 'api_settings_page'
                }
            ]
		},
        {
			path: '/publication/:hash_id',
			component: PublicationPage,
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'publication_page'
		},
        {
			path: '/placeholder',
			component: function() {
                return import('@D/views/placeholder/PlaceholderPage.vue');
            },
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'placeholder_page'
		},
        {
			path: '/bookmarks',
			component: function() {
                return import('@D/views/bookmarks/BookmarksPage.vue');
            },
            meta: {
                layout: Layouts.MAIN,
                auth: true,
            },
            redirect: { name: 'bookmarks_posts_page' },
            name: 'bookmarks_page',
            children: [
                {
                    path: 'posts',
                    component: function() {
                        return import('@D/views/bookmarks/children/posts/PostBookmarksPage.vue');
                    },
                    name: 'bookmarks_posts_page'
                },
                {
                    path: 'jobs',
                    component: function() {
                        return import('@D/views/bookmarks/children/jobs/JobBookmarksPage.vue');
                    },
                    name: 'bookmarks_jobs_page'
                },
                {
                    path: 'products',
                    component: function() {
                        return import('@D/views/bookmarks/children/products/ProductBookmarksPage.vue');
                    },
                    name: 'bookmarks_products_page'
                }
            ]
		},
        {
			path: '/about-author',
			component: function() {
                return import('@D/views/mtl/MansurTerlaPage.vue');
            },
            meta: {
                layout: Layouts.INFO,
                auth: false
            },
            name: 'about_author_page'
		},
        {
			path: '/live-stream',
			component: function() {
                return import('@D/views/live/LiveStreamPage.vue');
            },
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'live_stream_page'
		},
        {
			path: '/explore',
            name: 'explore_page',
			component: function() {
                return import('@D/views/explore/ExplorePage.vue');
            },
            redirect: { name: 'explore_posts_page' },
            props: true,
            children: [
                {
                    path: 'posts',
                    component: function() {
                        return import('@D/views/explore/children/posts/ExplorePostPage.vue');
                    },
                    name: 'explore_posts_page'
                },
                {
                    path: 'people',
                    component: function() {
                        return import('@D/views/explore/children/people/ExplorePeoplePage.vue');
                    },
                    name: 'explore_people_page'
                }
            ],
            meta: {
                layout: Layouts.MAIN,
                auth: true
            }
		},
        {
			path: '/videos',
			component: function() {
                return import('@D/views/videos/VideosPage.vue');
            },
            meta: {
                layout: Layouts.MAIN,
                auth: true,
                feature: 'videos'
            },
            name: 'videos_page'
		},
        WalletRoutes,
        StoryRoutes,
        {
			path: '/@:id([a-zA-Z0-9._]+)',
			component: ProfilePage,
            meta: {
                layout: Layouts.MAIN,
                auth: true
            },
            name: 'profile_page',
            props: true,
            redirect: { name: 'profile_posts_page' },
            children: [
                {
                    path: 'posts:?',
                    component: function() {
                        return import('@D/views/profile/parts/tabs/ProfilePosts.vue');
                    },
                    name: 'profile_posts_page'
                },
                {
                    path: 'media',
                    component: function() {
                        return import('@D/views/profile/parts/tabs/ProfileMedia.vue');
                    },
                    name: 'profile_media_page'
                },
                {
                    path: 'activity',
                    component: function() {
                        return import('@D/views/profile/parts/tabs/ProfileActivity.vue');
                    },
                    name: 'profile_activity_page'
                },
            ]
		},
        {
            path: '/bootstrap-error',
            name: 'server_error_bootstrap',
            component: function() {
                return import('@D/views/errors/bootstrap/BootstrapErrorPage.vue');
            },
            meta: {
                layout: Layouts.FLAT,
                auth: false
            }
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'server_error_404',
            component: Error404Page,
			meta: {
                layout: Layouts.MAIN,
                auth: true
            }
        },
	],
	linkActiveClass: 'active',
	linkExactActiveClass: 'active',
});

Router.beforeEach((to, from, next) => {
    let feature = to.meta.feature || null;

    if(feature) {
        if(! config(`features.${feature}.enabled`)) {
            return next({ name: 'server_error_404' });
        }
        else {
            next();
        }
    }
    else {
        next();
    }
});

export default Router;