<template>
	<div class="w-[64px] shrink-0">
		<div class="flex flex-col h-full w-full items-center py-6">
			<RouterLink v-bind:to="{ name: 'home_page' }" class="flex justify-center mb-4">
				<img class="h-7" v-bind:src="$embedder('assets.logos.url')" alt="Logo">
			</RouterLink>
			<div class="w-full px-4 pb-2">
				<Border></Border>
			</div>
			<div class="mb-2">
				<RouterLink v-bind:to="{ name: 'messenger_inbox' }">
					<ActionBarButton v-bind:hasBg="['messenger_inbox', 'messenger_chat_page'].includes($route.name)" iconName="message-chat-circle" iconType="line"></ActionBarButton>
				</RouterLink>
			</div>
			<ActionBarButton v-on:click="$comingSoon" v-bind:hasBg="false" iconName="archive" iconType="line"></ActionBarButton>
			<div class="mb-2">
				<ActionBarButton v-on:click="$comingSoon" v-bind:hasBg="false" iconName="phone" iconType="line"></ActionBarButton>
			</div>
			<div class="w-full px-4 py-2">
				<Border></Border>
			</div>

			<ActionBarButton v-on:click="$comingSoon" v-bind:hasBg="false" iconName="plus" iconType="solid"></ActionBarButton>

			<div class="mt-auto w-full">
				<div class="mb-2">
					<RouterLink v-bind:to="{ name: 'account_privacy_settings_page' }">
						<ActionBarButton iconName="settings-04" v-bind:hasBg="false" iconType="line"></ActionBarButton>
					</RouterLink>
				</div>
				<div class="flex justify-center">
					<div class="size-10 overflow-hidden rounded-full cursor-pointer" v-on:click="openAccountSwitcherModal">
						<img class="w-full" v-bind:src="userData.avatar_url" alt="Avatar">
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';
	import { useAuthStore } from '@D/store/auth/auth.store.js';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';

	import ActionBarButton from '@D/components/layout/parts/navbar/ActionBarButton.vue';

	export default defineComponent({
		setup: function () {
			const authStore = useAuthStore();
			
			return {
				userData: computed(() => {
                    return authStore.userData;
                }),
				openAccountSwitcherModal: () => {
                    colibriEventBus.emit('account-switcher:open');
                },
			}
		},
		components: {
			ActionBarButton: ActionBarButton
		}
	});
</script>