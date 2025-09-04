<template>
	<RouterLink v-on:click="markAsRead" v-bind:to="{ name: 'messenger_chat_page', params: {chat_id: chatData.chat_id } }" class="flex gap-3 items-center pl-4" v-bind:class="[isSelectedChat ? 'bg-fill-qt' : '']">
		<div class="shrink-0">
			<AvatarNormal v-bind:avatarSrc="chatData.chat_info.avatar_url"></AvatarNormal>
		</div>

		<div class="flex-1 overflow-hidden border-b pr-4 py-3" v-bind:class="[isSelectedChat ? 'border-b-transparent' : 'border-b-bord-pr']">
			<div class="flex justify-between items-center gap-4">
				<strong class="font-semibold text-par-n whitespace-nowrap truncate text-lab-pr2">
					{{ chatData.chat_info.name }}
					<VerificationBadge v-if="chatData.chat_info.verified"></VerificationBadge>
				</strong>
				<time class="text-par-s text-lab-sc whitespace-nowrap">{{ chatData.last_activity.time_ago }}.</time>
			</div>
			<div class="flex items-center justify-between">
				<template v-if="isTyping">
					<span class="truncate max-w-full text-green-900 text-par-s font-medium">
						{{ $t('chat.typing') }}
					</span>
				</template>
				<template v-else>
					<span class="truncate max-w-full text-lab-pr2 text-par-s min-h-4">
						{{ chatData.is_deleted ? $t('chat.message_is_deleted') : chatData.last_message }}
					</span>
					<BadgeCounter
						color="bg-green-600"
						v-if="!isSelectedChat && chatData.unread_messages_count.raw"
					v-bind:count="chatData.unread_messages_count.formatted"></BadgeCounter>
				</template>
			</div>
		</div>
	</RouterLink>
</template>

<script>
	import { defineComponent, computed, onMounted, reactive, ref, onUnmounted } from 'vue';
	import { useChatStore } from '@D/store/chats/chat.store.js';

	import AvatarNormal from '@D/components/general/avatars/AvatarNormal.vue';
	import BRD from '@/kernel/websockets/brd/index.js';
	import BadgeCounter from '@D/components/general/counters/BadgeCounter.vue';

	export default defineComponent({
		props: {
			chatData: {
				type: Object,
				required: true
			}
		},
		setup: function(props) {
			const chatData = ref(props.chatData);
			const chatStore = useChatStore();
			const selectedChatData = computed(() => {
				return chatStore.chatData;
			});

			const state = reactive({
				typing: {
                    is_typing: false,
                    user: null
                }
			});

			onUnmounted(() => {
                if(window.ColibriBRConnected) {
					ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).stopListeningForWhisper(BRD.getEvent('CHAT_MESSAGE_TYPING'));
				}
			});

			onMounted(() => {
				if(window.ColibriBRConnected) {
					ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).listenForWhisper(BRD.getEvent('CHAT_MESSAGE_TYPING'), function (event) {
						state.typing = event.data;
					});
				}
			});

			return {
				state: state,
				isSelectedChat: computed(() => {
					return (selectedChatData.value && selectedChatData.value.chat_id === props.chatData.chat_id);
				}),
				isTyping: computed(() => {
                    return state.typing.is_typing;
                }),
				markAsRead: () => {
					chatData.value.unread_messages_count.raw = 0;
					chatData.value.unread_messages_count.formatted = 0;
				}
			}
		},
		components: {
			AvatarNormal: AvatarNormal,
			BadgeCounter: BadgeCounter
		}
	});
</script>