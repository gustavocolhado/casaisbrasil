<template>
	<div class="h-16 flex justify-between items-center px-6">
		<div class="inline-flex items-center leading-none">
			<AvatarSmall v-bind:avatarSrc="chatData.chat_info.avatar_url"></AvatarSmall>
			<div class="ml-3">
				<h4 class="text-par-m font-medium mb-1.5 text-lab-pr">
					{{ chatData.chat_info.name }} <VerificationBadge v-if="chatData.chat_info.verified" size="sm"></VerificationBadge>
				</h4>
				<span class="block text-cap-s text-lab-sc">
					<template v-if="isTyping">
						{{ $t('chat.typing') }}
					</template>
					<template v-else>
						{{ $t('labels.was_online_at', { time: chatData.chat_info.last_active.formatted }) }}
					</template>
				</span>
			</div> 
		</div>
		<div class="inline-flex gap-1">
			<PrimaryIconButton v-on:click="$comingSoon" v-bind:disabled="true" iconName="phone" iconType="line"></PrimaryIconButton>
			<PrimaryIconButton v-on:click="$comingSoon" v-bind:disabled="true" iconName="search-lg"></PrimaryIconButton>
			<PrimaryIconButton v-on:click="state.openChatInfo = true" iconName="info-circle" iconType="line"></PrimaryIconButton>
		</div>
	</div>

	<ChatInfoModal v-if="state.openChatInfo" v-on:close="state.openChatInfo = false"></ChatInfoModal>
</template>

<script>
	import { defineComponent, ref, reactive, computed } from 'vue';
	import { useChatStore } from '@D/store/chats/chat.store.js';
	import AvatarSmall from '@D/components/general/avatars/AvatarSmall.vue';
	import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';
	import ChatInfoModal from '@D/views/messenger/children/chat/parts/ChatInfoModal.vue';

	export default defineComponent({
		props: {
			typingUser: {
				type: Object,
				default: {
					is_typing: false,
					user: null
				}
			}
		},
		setup: function (props) {
			const state = reactive({
				openChatInfo: false
			});

			const chatStore = useChatStore();
			const chatData = ref(chatStore.chatData);

			return {
				chatData: chatData,
				state: state,
				isTyping: computed(() => {
					return props.typingUser.is_typing === true;
				})
			};
		},
		components: {
			AvatarSmall: AvatarSmall,
			PrimaryIconButton: PrimaryIconButton,
			ChatInfoModal: ChatInfoModal
		}
	});
</script>