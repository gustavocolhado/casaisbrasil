<template>
	<div class="pl-6 shrink-0">
		<div class="flex flex-col h-full w-full justify-end items-center pb-6">
			<div v-if="! isWSEstablished" class="mb-4">
				<ActionBarButton v-on:click="showWSConnectionError" iconName="signal-03" buttonColor="text-red-900" v-bind:hasBg="false"></ActionBarButton>
			</div>
			<div v-on:click="openAccountSwitcherModal" class="flex justify-center cursor-pointer">
				<img class="size-10 rounded-full border border-bord-pr" v-bind:src="userData.avatar_url" alt="Avatar">
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';
	import { useAuthStore } from '@D/store/auth/auth.store.js';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';
	
	import AvatarMedium from '@D/components/general/avatars/AvatarMedium.vue';
	import ActionBarButton from '@D/components/layout/parts/navbar/ActionBarButton.vue';

	export default defineComponent({
		setup: function () {
			const authStore = useAuthStore();

			return {
				userData: computed(() => {
                    return authStore.userData;
                }),
				openPostEditorModal: () => {
                    colibriEventBus.emit('post-editor:open');
                },
				openAccountSwitcherModal: () => {
                    colibriEventBus.emit('account-switcher:open');
                },
				isWSEstablished: computed(() => {
                    return (window.ColibriBRConnected !== false);
                }),
				showWSConnectionError: () => {
					alert('If you see this message, it means that the WS connection is not established. Some features will not work properly. Please, try to refresh the page or contact support.');
				}
			};
		},
		components: {
            AvatarMedium: AvatarMedium,
			ActionBarButton: ActionBarButton
		}
	});
</script>