<template>
	<Backdrop>
		<div class="w-navbar popup-background-sc fixed top-0 bottom-0 left-0 pt-4">
			<div class="h-full flex flex-col">
				<div class="border-b border-b-bord-pr">
					<div class="px-4 flex items-center justify-between pb-4">
						<h4 class="text-par-l tracking-tighter font-medium text-lab-pr">
							{{ $t('notifs.notifications_title') }}
						</h4>
						<div class="shrink-0">
							<ModalCloseButton v-on:click="closeModal"></ModalCloseButton>
						</div>
					</div>
					<div class="grid grid-cols-3 text-lab-pr">
						<button v-on:click="handleTabChange('all')" class="border-b-2 truncate text-par-s text-center px-4 py-3" v-bind:class="[state.tab == 'all' ? 'border-b-lab-pr' : 'border-b-transparent']">
							{{ $t('notifs.all_notifications') }}
						</button>
						<button v-on:click="handleTabChange('mentions')" class="border-b-2 truncate text-par-s text-center px-4 py-3" v-bind:class="[state.tab == 'mentions' ? 'border-b-lab-pr' : 'border-b-transparent']">
							{{ $t('notifs.mentions') }}
						</button>
						<button v-on:click="handleTabChange('important')" class="border-b-2 truncate text-par-s text-center px-4 py-3" v-bind:class="[state.tab == 'important' ? 'border-b-lab-pr' : 'border-b-transparent']">
							{{ $t('notifs.important_notifications') }}
						</button>
					</div>
				</div>
				<div class="flex-1 overflow-y-auto">
					<template v-if="state.isLoading">
						<NotificationItemSkeleton v-for="i in 7"></NotificationItemSkeleton>
					</template>
					<template v-else>
						<div v-if="notifications.length">
							<NotificationItem 
								v-for="notificationItem in notifications"
								v-on:route="handleRouting"
							v-bind:notificationData="notificationItem"></NotificationItem>
						</div>
						<div v-else>
							<div class="py-14">
								<p class="text-par-s text-lab-sc text-center">
									{{ $t('notifs.no_notifications') }}
								</p>
							</div>
						</div>
					</template>
				</div>
				<div class="shrink-0">
					<NotificationSoundControl></NotificationSoundControl>
				</div>
			</div>
		</div>
	</Backdrop>
</template>

<script>
	import { defineComponent, computed, onMounted, reactive, onUnmounted } from 'vue';
	import { useNotificationsStore } from '@D/store/notifications/notifications.store.js';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';
	import { useRouter } from 'vue-router';

	import Backdrop from '@D/components/general/modals/Backdrop.vue';
	import NotificationItem from '@D/components/notifications/native/parts/NotificationItem.vue';
	import NotificationItemSkeleton from '@D/components/notifications/native/parts/NotificationItemSkeleton.vue';
	import NotificationSoundControl from '@D/components/notifications/native/parts/NotificationSoundControl.vue';
	import PageTitle from '@D/components/layout/PageTitle.vue';
	import ModalCloseButton from '@D/components/general/modals/parts/buttons/ModalCloseButton.vue';

	export default defineComponent({
		setup: function() {
			const state = reactive({
				tab: 'all',
				isLoading: true
			});

			const router = useRouter();
			const notificationsStore = useNotificationsStore();

            const notifications = computed(() => {
                return notificationsStore.notifications;
            });

			const handleNotificationReceived = async () => {
				state.tab = 'all';
				await notificationsStore.fetchNotifications(state.tab);
			};
            
            onMounted(async () => {
                await notificationsStore.fetchNotifications(state.tab);

				state.isLoading = false;

                notificationsStore.fetchUnreadCount();

				colibriEventBus.on('notifications:received', handleNotificationReceived);
            });

			onUnmounted(() => {
				colibriEventBus.off('notifications:received', handleNotificationReceived);
			});

			const handleTabChange = async (tab) => {
				state.tab = tab;
				state.isLoading = true;
				await notificationsStore.fetchNotifications(state.tab);
				state.isLoading = false;
			};

			const closeModal = () => {
				notificationsStore.closeNotifications();
			}

			return {
				state: state,
				notifications: notifications,
				handleTabChange: handleTabChange,
				handleRouting: (routeData) => {
					closeModal();
					router.push(routeData);
				},
				closeModal: closeModal
			};
		},
		components: {
			Backdrop: Backdrop,
			NotificationItem: NotificationItem,
			PageTitle: PageTitle,
			ModalCloseButton: ModalCloseButton,
			NotificationItemSkeleton: NotificationItemSkeleton,
			NotificationSoundControl: NotificationSoundControl
		}
	});
</script>