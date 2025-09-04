<template>
    <div class="flex flex-col gap-3.5">
        <div class="block">
            <RouterLink v-bind:to="{ name: 'home_page' }" v-slot="{ isActive }" class="block">
                <div class="flex items-center" v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="home-smile" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.home') }}
                    </span>
                </div>
            </RouterLink>
        </div>

        <div class="block">
            <RouterLink v-bind:to="{ name: 'explore_posts_page' }" v-slot="{ isActive }" class="block">
                <div class="flex items-center"  v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="hash-02"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.explore') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        <div class="block">
            <div v-on:click="openNotificationsModal" class="flex items-center sidenav-inactive cursor-pointer">
                <span class="size-icon-normal shrink-0">
                    <SvgIcon name="bell-01" type="line"></SvgIcon>
                </span>
                <span class="ml-3 text-par-l">
                    {{ $t('labels.notifications') }}

                    <BadgeCounter v-if="notificationsCount.raw" v-bind:count="notificationsCount.formatted"></BadgeCounter>
                </span>
            </div>
        </div>
        <div class="block">
            <RouterLink v-bind:to="{ name: 'messenger_page' }" v-slot="{ isActive }" class="block">
                <div class="flex items-center"  v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="message-chat-circle" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.messages') }}

                        <BadgeCounter v-if="inboxCount.raw" v-bind:count="inboxCount.formatted"></BadgeCounter>
                    </span>
                </div>
            </RouterLink>
        </div>
        <div class="block" v-if="$config('features.videos.enabled')">
            <RouterLink v-bind:to="{ name: 'videos_page' }" v-slot="{ isActive }" class="block">
                <div class="flex items-center"  v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="clapperboard" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.videos') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        <div class="block" v-if="$config('features.marketplace.enabled')">
            <RouterLink v-bind:to="{ name: 'marketplace_page' }" v-slot="{ isActive }" class="block">
                <div class="flex items-center" v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="shopping-bag-03" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.marketplace') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        
        <div class="block">
            <RouterLink v-bind:to="{ name: 'bookmarks_page' }" v-slot="{ isActive }" class="block">
                <div  class="flex items-center" v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="bookmark" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.bookmarks') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        <div class="block" v-if="$config('features.jobs.enabled')">
            <RouterLink v-bind:to="{ name: 'jobs_page' }" v-slot="{ isActive }" class="block">
                <div  class="flex items-center" v-bind:class="[((isActive == true) ? 'sidenav-active' : 'sidenav-inactive')]">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="briefcase-01" v-bind:type="(isActive == true) ? 'solid' : 'line'"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.jobs') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        
        <div class="block">
            <RouterLink v-bind:to="{ name: 'profile_page', params: { id: userData.username } }" v-slot="{ isActive }" class="block">
                <div  class="flex items-center sidenav-inactive">
                    <span class="size-icon-normal shrink-0">
                        <SvgIcon name="user-01" type="line"></SvgIcon>
                    </span>
                    <span class="ml-3 text-par-l">
                        {{ $t('labels.my_profile') }}
                    </span>
                </div>
            </RouterLink>
        </div>
        <div class="block pl-icon-normal pr-6">
            <span class="block bg-bord-sc h-px mx-2"></span>
        </div>
        <div class="block">
            <NavbarDropdown></NavbarDropdown>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { useNotificationsStore } from '@D/store/notifications/notifications.store.js';
    import { useInboxStore } from '@D/store/chats/inbox.store.js';
    import { colibriSounds } from '@/kernel/services/sounds/index.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';

    import BadgeCounter from '@D/components/general/counters/BadgeCounter.vue';
    import BRD from '@/kernel/websockets/brd/index.js';

    export default defineComponent({
        setup: function() {
            const authStore = useAuthStore();
            const notificationsStore = useNotificationsStore();
            const inboxStore = useInboxStore();
            const notificationsCount = computed(() => {
                return notificationsStore.unreadCount;
            });

            const inboxCount = computed(() => {
                return inboxStore.unreadCount;
            });

            onMounted(() => {
                notificationsStore.fetchUnreadCount();

                inboxStore.fetchUnreadCount();

                if(window.ColibriBRD) {
                    ColibriBRD.private(BRD.getChannel('AUTH_USER', [authStore.userData.id])).notification(function (event) {
                        if(event.type === 'chat.notification') {
                            inboxStore.fetchUnreadCount();
                        }
                        else {
                            notificationsStore.setUnreadNotificationsCount(event.data);
                            colibriEventBus.emit('notifications:received');
                        }

                        if(localStorage.getItem('notificationsSound')) {
                            if(event.type === 'chat.notification') {
                                colibriSounds.backgroundChatMessageReceived();
                            }
                            else {
                                colibriSounds.notificationReceived();
                            }
                        }
                    });
                }
            });

            onUnmounted(() => {
                colibriEventBus.off('notifications:received');

                if(window.ColibriBRD) {
                    ColibriBRD.leave(BRD.getChannel('AUTH_USER', [authStore.userData.id]));
                }
            });

            return {
                notificationsCount: notificationsCount,
                inboxCount: inboxCount,
                userData: authStore.userData,
                openNotificationsModal: () => {
                    notificationsStore.openNotifications();
                }
            };
        },
        components: {
            NavbarDropdown: defineAsyncComponent(() => {
                return import('@D/components/layout/parts/navbar/NavbarDropdown.vue');
            }),
            BadgeCounter: BadgeCounter
        }
    });
</script>