<template>
    <aside class="flex fixed left-0 top-0 bottom-0 sticky-bar-bottom-offset z-50">
        <template v-if="isMessenger">
            <MessengerActionBar></MessengerActionBar>
        </template>
        <template v-else>
            <div class="shrink-0 flex w-page-offset">
                <ApplicationActionBar></ApplicationActionBar>
                <div class="flex-1 h-full shrink-0">
                    <div class="flex flex-col h-full pt-6">
                        <div class="mb-8 mx-6">
                            <div class="flex items-center gap-2">
                                <div class="block">
                                    <RouterLink v-bind:to="{ name: 'home_page' }">
                                        <img class="h-7" v-bind:src="$embedder('assets.logos.url')" alt="Logo">
                                    </RouterLink>
                                </div>
                            </div>
                        </div>
                        <div class="pl-6">
                            <ApplicationNavbar></ApplicationNavbar>
                        </div>
                        <div class="pl-6 mt-auto mb-4">
                            <div class="flex flex-wrap mb-2 leading-5">
                                <a v-if="$config('features.business_accounts.enabled')" v-bind:href="$getRoute('ads_home_index')" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.business_account') }}
                                </a>
                                <RouterLink v-bind:to="{ name: 'theme_settings_page' }" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.theme') }}
                                </RouterLink>
                                <RouterLink v-if="$config('features.jobs.enabled')" v-bind:to="{ name: 'jobs_page' }" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.jobs') }}
                                </RouterLink>
                                <a v-bind:href="$getRoute('help_center')" target="_blank" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.help_center') }}
                                </a>
                                <a v-bind:href="$getRoute('api_developers')" target="_blank" v-if="$config('features.api.enabled')" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.api_developers') }}
                                </a>
                                <a v-bind:href="$getRoute('privacy_policy')" target="_blank" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.privacy_policy') }}
                                </a>
                                <a v-bind:href="$getRoute('cookies_policy')" target="_blank" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.cookies_policy') }}
                                </a>
                                <a v-bind:href="$getRoute('terms_of_use')" target="_blank" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.terms') }}
                                </a>
                                <RouterLink v-bind:to="{ name: 'language_settings_page' }" class="hover:underline text-cap-s text-lab-sc mr-2">
                                    {{ $t('labels.language') }}
                                </RouterLink>
                            </div>
                            <div class="leading-5">
                                <span class="text-cap-s text-lab-sc">
                                    {{ appName }} &copy; {{ currentYear }}
                                    <RouterLink v-if="! hideAuthorAttribution" v-bind:to="{ name: 'about_author_page' }">
                                        <span class="block whitespace-nowrap hover:underline hover:text-brand-900">Created by Mansur Terla</span>
                                    </RouterLink>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <div v-if="ContextNavar" class="w-navbar h-full border-l border-l-fill-pr">
            <Component v-bind:is="ContextNavar"/>
        </div>
    </aside>
</template>

<script>
    import { defineComponent, computed, defineAsyncComponent } from 'vue';
    import { useRoute } from 'vue-router';
    
    import ApplicationNavbar from '@D/components/layout/ApplicationNavbar.vue';
    import ApplicationActionBar from '@D/components/layout/parts/navbar/ApplicationActionBar.vue';
    import MessengerActionBar from '@D/components/layout/parts/navbar/MessengerActionBar.vue';
    

    export default defineComponent({
        setup: function() {
            const route = useRoute();
            
            const ContextNavar = computed(() => {
                if(route.meta.contextNavbar) {
                    if(route.meta.sectionName == 'settings') {
                        return defineAsyncComponent({
                            loader: () => {
                                return import('@D/views/settings/parts/SettingsNavbar.vue');
                            },
                            delay: 200,
                            timeout: 3000
                        });
                    }
                    else if(route.meta.sectionName == 'messenger') {
                        return defineAsyncComponent({
                            loader: () => {
                                return import('@D/views/messenger/history/MessengerNavbar.vue');
                            },
                            delay: 200,
                            timeout: 3000
                        });
                    }
                }

                return null;
            });

            return {
                isMessenger: computed(() => {
                    return route.meta.sectionName == 'messenger';
                }),
                appName: BackendEmbeds.config.app.name,
                currentYear: (new Date()).getFullYear(),
                ContextNavar: ContextNavar,
                hideAuthorAttribution: window.HIDE_AUTHOR_ATTRIBUTION
            }
        },
        components: {
            ApplicationNavbar: ApplicationNavbar,
            ApplicationActionBar: ApplicationActionBar,
            MessengerActionBar: MessengerActionBar
        }
    });
</script>