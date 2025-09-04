<template>
    <div class="flex h-screen overflow-hidden flex-col">
        <div class="border-b border-fill-pr shrink-0">
            <ChatHeaderSkeleton v-if="state.isLoading"></ChatHeaderSkeleton>
            <ChatHeader v-else v-bind:typingUser="state.typing"></ChatHeader>
        </div>
        <div ref="chatContainerBlock" class="flex-1 overflow-x-hidden overflow-y-auto py-4">
            <div class="border-b border-fill-pr py-8">
                <ChatOverviewSkeleton v-if="state.isLoading"></ChatOverviewSkeleton>
                <ChatOverview v-else></ChatOverview>
            </div>
            <div class="pb-24 pt-2">
                <div v-if="state.isLoading" class="flex flex-col gap-4 opacity-70">
                    <ChatMessageSkeleton v-for="i in 3"></ChatMessageSkeleton>
                </div>
                <div v-else>
                    <template v-if="chatMessages.length">
                        <div v-for="messageData in chatMessages" class="block">
                            <ChatMessage
                                v-on:deletemessage="handleMessageDelete"
                                v-on:replytomessage="handleMessageReply"
                                v-on:copytext="handleMessageCopy"
                            v-bind:messageData="messageData"
                            v-bind:key="messageData.id"></ChatMessage>
                        </div>
                    </template>
                    <template v-else>
                        <div class="py-12 text-center">
                            <p class="text-par-s tracking-tighter text-lab-sc">
                                {{  $t('chat.no_messages_found') }}
                            </p>
                        </div>
                    </template>
                    <ChatMessageTyping v-if="isTyping" v-bind:typingUser="state.typing"></ChatMessageTyping>
                </div>
            </div>
        </div>
        <div class="shrink-0">
            <ChatFormSkeleton v-if="state.isLoading"></ChatFormSkeleton>
            <ChatForm v-else v-on:typing="handleMessageTyping"></ChatForm>
        </div>
    </div>
</template>

<script>
    import { defineComponent, ref, nextTick, onMounted, reactive, computed, onUnmounted, defineAsyncComponent } from 'vue';
    import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
    import { colibriSounds } from '@/kernel/services/sounds/index.js';
    import { useRoute, useRouter } from 'vue-router';
    import { useChatStore } from '@D/store/chats/chat.store.js';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';
    import { useI18n } from 'vue-i18n';
    
    import ChatHeader from '@D/views/messenger/children/chat/parts/ChatHeader.vue';
    import ChatHeaderSkeleton from '@D/views/messenger/children/chat/parts/skeletons/ChatHeaderSkeleton.vue';
    import ChatFormSkeleton from '@D/views/messenger/children/chat/parts/skeletons/ChatFormSkeleton.vue';
    import ChatOverviewSkeleton from '@D/views/messenger/children/chat/parts/skeletons/ChatOverviewSkeleton.vue';
    import ChatMessageSkeleton from '@D/views/messenger/children/chat/parts/skeletons/ChatMessageSkeleton.vue';
    import ChatOverview from '@D/views/messenger/children/chat/parts/ChatOverview.vue';
    import ChatMessage from '@D/views/messenger/children/chat/parts/ChatMessage.vue';
    import ChatMessageTyping from '@D/views/messenger/children/chat/parts/ChatMessageTyping.vue';
    import ChatForm from '@D/views/messenger/children/chat/parts/ChatForm.vue';
    import BRD from '@/kernel/websockets/brd/index.js';
    

    export default defineComponent({
        setup: function(props, context) {
            const state = reactive({
                isLoading: true,
                typing: {
                    is_typing: false,
                    user: null
                }
            });

            const { t } = useI18n();
            const authStore = useAuthStore();
            const toastNotifier = new ToastNotifier();
            const chatStore = useChatStore();
            const router = useRouter();
            const route = useRoute();
            const userData = ref(authStore.userData);
            const chatData = computed(() => {
                return chatStore.chatData;
            });

            const chatMessages = computed(() => {
                return chatStore.chatMessages;
            });

            const chatContainerBlock = ref(null);

            const scrollBlockDown = function() {
                nextTick(() => {
                    chatContainerBlock.value.scrollTop = chatContainerBlock.value.scrollHeight;
                });
            }

            onUnmounted(() => {
                if(window.ColibriBRConnected) {
                    stopListenEventInChat(BRD.getEvent('CHAT_MESSAGE_RECEIVED'));
                    stopListenEventInChat(BRD.getEvent('CHAT_MESSAGE_READ'));
                    stopListenEventInChat(BRD.getEvent('CHAT_MESSAGE_DELETED'));
                    stopListeningForWhisperInChat(BRD.getEvent('CHAT_MESSAGE_TYPING'));
                }
            });

            onMounted(async function() {
                try {
                    await chatStore.fetchChatData(route.params.chat_id);
                    await chatStore.fetchChatMessages();

                    if (chatMessages.value.length > 0) {
                        chatStore.markMessagesAsRead();

                        debounce(() => {
                            scrollBlockDown();
                        }, 500);
                    }
                    
                    state.isLoading = false;

                    if(window.ColibriBRConnected) {
                        listenEventInChat(BRD.getEvent('CHAT_MESSAGE_RECEIVED'), function (event) {
                            let messageData = event.data;

                            chatStore.appendMessage(messageData);

                            scrollBlockDown();
                            
                            let isSender = (userData.value.id == messageData.user_id);

                            if(! isSender) {
                                colibriSounds.activeChatMessageReceived();
                                chatStore.markMessagesAsRead();
                            }
                        });

                        listenEventInChat(BRD.getEvent('CHAT_MESSAGE_DELETED'), function (event) {
                            chatStore.markMessageAsDeleted(event.data.message_id);
                        });

                        listenWhisperInChat(BRD.getEvent('CHAT_MESSAGE_TYPING'), function (event) {
                            state.typing = event.data;
                        });

                        listenEventInChat(BRD.getEvent('CHAT_MESSAGE_READ'), function (event) {
                            chatStore.updateLastReadMessageForParticipant(event.data);
                        });
                    }
                } catch (error) {
                    router.push({
                        name: 'server_error_404',
                        params: { pathMatch: route.path.substring(1).split('/') },
                        query: route.query,
                        hash: route.hash
                    });
                }
            });

            const stopListenEventInChat = (eventName) => {
                ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).stopListening(eventName);
            }

            const listenEventInChat = (eventName, callback) => {
                ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).listen(eventName, callback);
            }

            const stopListeningForWhisperInChat = (whisperEvent) => {
                ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).stopListeningForWhisper(whisperEvent);
            }

            const listenWhisperInChat = (whisperEvent, callback) => {
                ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).listenForWhisper(whisperEvent, callback);
            }

            const whisperToChat = (whisperEvent, eventData) => {
                ColibriBRD.private(BRD.getChannel('CHAT', [chatData.value.chat_id])).whisper(whisperEvent, eventData);
            }

            const broadcastTyping = (isTyping) => {
                whisperToChat(BRD.getEvent('CHAT_MESSAGE_TYPING'), {
                    data: {
                        user: {
                            name: userData.value.name
                        },
                        is_typing: isTyping
                    }
                });
            }

            return {
                state: state,
                chatData: chatData,
                chatMessages: chatMessages,
                chatContainerBlock: chatContainerBlock,
                isTyping: computed(() => {
                    return state.typing.is_typing;
                }),
                handleMessageDelete: (messageData) => {
                    let isSender = userData.value.id === messageData.userId;

                    colibriEventBus.emit('confirmation-modal:open', {
                        title: t('prompt.delete_message.title'),
                        description: (isSender ? t('prompt.delete_message.description') : t('prompt.delete_message_for_me.description')),
                        confirmButtonText: (isSender ? null : t('prompt.delete_message_for_me.confirm')),
                        onConfirm: async () => {
                            await chatStore.deleteMessage(messageData.messageId);

                            toastNotifier.notifyShort(t('toast.chat.message_deleted'), 1000);
                        },
                        slotComponent: (isSender ? defineAsyncComponent(() => { return import('@D/views/messenger/children/chat/parts/modals/MessageDeleteForAllOption.vue'); }) : null)
                    });
                },
                handleMessageReply: (messageData) => {
                    colibriEventBus.emit('messenger-message:reply', {
                        messageData: messageData
                    });
                },
                handleMessageCopy: (messageData) => {
                    navigator.clipboard.writeText(messageData.content).then(() => {
                        toastNotifier.notifyShort(t('toast.chat.message_text_copied'), 1000);
                    });
                },
                handleMessageTyping: () => {
                    if(window.ColibriBRConnected) {
                        broadcastTyping(true);

                        debounce(() => {
                            broadcastTyping(false);
                        }, 1000);
                    }
                }
            }
        },
        components: {
            ChatHeader: ChatHeader,
            ChatOverview: ChatOverview,
            ChatMessage: ChatMessage,
            ChatMessageTyping: ChatMessageTyping,
            ChatForm: ChatForm,
            ChatHeaderSkeleton: ChatHeaderSkeleton,
            ChatFormSkeleton: ChatFormSkeleton,
            ChatOverviewSkeleton: ChatOverviewSkeleton,
            ChatMessageSkeleton: ChatMessageSkeleton
        }
    });
</script>