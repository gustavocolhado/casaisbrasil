<template>
	<div class="block">
		<div class="flex justify-center">
			<div class="w-content">
				<div class="flex justify-center">
					<AvatarLarge v-bind:avatarSrc="chatData.chat_info.avatar_url"></AvatarLarge>
				</div>
				<div class="text-center my-3 flex flex-col gap-1">
					<h1 class="text-title-2 font-bold text-lab-pr tracking-tighter">
						{{ chatData.chat_info.name }} <VerificationBadge v-if="chatData.chat_info.verified" size="md"></VerificationBadge>
					</h1>
					<span class="block text-par-s text-lab-sc">
						{{ $t('labels.was_online_at', { time: chatData.chat_info.last_active.formatted }) }}
					</span>
					<span v-if="isFollowedBy" class="block text-par-s text-lab-sc">
						{{ $t('labels.following_you_on', { app_name: $embedder('config.app.name') }) }}
					</span>
					<span v-if="hasDescription" class="block text-par-s text-lab-pr2">
						{{ chatData.chat_info.description }}
					</span>
					<span  class="block text-par-s text-lab-sc">
						{{ chatData.chat_info.followers_count.formatted }} {{ $t('labels.followers_count', chatData.chat_info.followers_count.raw) }}
					</span>
				</div>
				<div v-if="isDirect" class="flex justify-center">
					<RouterLink v-bind:to="{ name: 'profile_page', params: { id: chatData.chat_info.username }}">
						<PrimaryPillButton buttonType="submit" buttonSize="md" v-bind:buttonText="$t('labels.view_profile')"></PrimaryPillButton>
					</RouterLink>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import { useChatStore } from '@D/store/chats/chat.store.js';
	import AvatarLarge from '@D/components/general/avatars/AvatarLarge.vue';
    import PrimaryPillButton from '@D/components/inter-ui/buttons/PrimaryPillButton.vue';
	
	export default defineComponent({
		setup: function () {
			const chatStore = useChatStore();
			const chatData = ref(chatStore.chatData);

			return {
				chatData: chatData,
				isDirect: chatStore.isDirect,
				hasDescription: chatStore.hasDescription,
				isFollowedBy: chatStore.isFollowedBy
			};
		},
		components: {
            PrimaryPillButton: PrimaryPillButton,
			AvatarLarge: AvatarLarge
		}
	});
</script>