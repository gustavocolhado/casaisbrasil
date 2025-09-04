<template>
	<PrimaryTransition>
        <ContentModal position="absolute">
            <ModalHeader v-bind:modalTitle="$t('labels.information')" v-on:close="closeModal"></ModalHeader>
            <div class="block">
                <div class="py-4 px-6">
                    <ChatOverview></ChatOverview>
                </div>
                <Border height="h-3" bg="bg-fill-qt" opacity="opacity-70"></Border>
                <div class="py-4">
                    <ChatParticipants></ChatParticipants>
                </div>
                <Border height="h-3" bg="bg-fill-qt" opacity="opacity-70"></Border>
                <ModalRowButton v-on:click="$comingSoon" v-bind:buttonText="$t('chat.add_participant')" iconName="user-plus-01"></ModalRowButton>
                <Border></Border>
                <ModalRowButton v-on:click="clearConversation" v-bind:buttonText="$t('chat.clear_conversation')" iconName="brush-03"></ModalRowButton>
                <Border></Border>
                <ModalRowButton v-on:click="reportInterlocutor" buttonRole="danger" v-bind:buttonText="$t('labels.report_this_user', { user_name: chatData.chat_info.name })" iconName="annotation-alert"></ModalRowButton>
                <Border></Border>
                <ModalRowButton v-on:click="$comingSoon" buttonRole="danger" v-bind:buttonText="$t('labels.block_this_user', { user_name: chatData.chat_info.name })" iconName="slash-circle-01"></ModalRowButton>
                <Border></Border>
                <ModalRowButton v-on:click="deleteChat" buttonRole="danger" v-bind:buttonText="isGroup ? $t('chat.delete_group') : $t('chat.delete_chat')" iconName="trash-04"></ModalRowButton>
                <Border height="h-3" bg="bg-fill-qt" opacity="opacity-70"></Border>
                <div class="px-4 py-4">
                    <span class="text-lab-sc text-cap-l">
                        {{ $t('chat.chat_created_date', { date: chatData.date.iso })}}
                    </span>
                </div>
            </div>
        </ContentModal>
    </PrimaryTransition>
</template>

<script>
    import ContentModal from '@D/components/general/modals/ContentModal.vue';
    import ModalHeader from '@D/components/general/modals/parts/ModalHeader.vue';
    import ModalRowButton from '@D/components/inter-ui/buttons/ModalRowButton.vue';
    import ChatOverview from '@D/views/messenger/children/chat/parts/ChatOverview.vue';
    import ChatParticipants from '@D/views/messenger/children/chat/parts/participants/ChatParticipants.vue';

	import { computed, defineComponent, ref } from 'vue';
    import { useChatStore } from '@D/store/chats/chat.store.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';
    import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';

	export default defineComponent({
        emits: ['close'],
		setup: function (props, context) {
            const { t } = useI18n();
            const router = useRouter();
            const toastNotifier = new ToastNotifier();
            const chatStore = useChatStore();
            const chatData = ref(chatStore.chatData);

            const closeModal = () => {
                context.emit('close');
            }

			return {
                chatData: chatData,
			    closeModal: closeModal,
                isGroup: computed(() => {
                    return chatData.value.type == 'group';
                }),
                clearConversation: () => {
                    closeModal();

                    colibriEventBus.emit('confirmation-modal:open', {
                        title: t('prompt.clear_conversation.title'),
                        description: t('prompt.clear_conversation.desc'),
                        confirmButtonText: t('prompt.clear_conversation.confirm'),
                        onConfirm: async () => {
                            try {
                                if(chatStore.chatMessages.length) {
                                    await chatStore.clearChatConversation();
                                }

                                toastNotifier.notifyShort(t('toast.chat.chat_cleared'), 3000);
                            } catch (error) {
                                toastNotifier.notifyShort(error, 3000);
                            }
                        }
                    });
                },
                deleteChat: () => {
                    closeModal();

                    colibriEventBus.emit('confirmation-modal:open', {
                        title: t('prompt.delete_chat.title'),
                        description: t('prompt.delete_chat.desc'),
                        onConfirm: async () => {
                            try {
                                await chatStore.deleteChat(chatData.value.chat_id);

                                router.push({
                                    name: 'messenger_inbox'
                                });

                                toastNotifier.notifyShort(t('toast.chat.chat_deleted'), 3000);
                            } catch (error) {
                                toastNotifier.notifyShort(error, 3000);
                            }
                        }
                    });
                },
                reportInterlocutor: () => {
                    closeModal();
                    
                    colibriEventBus.emit('report:open', {
                        type: 'user',
                        reportableId: chatData.value.chat_info.id
                    });
                }
			};
		},
		components: {
		    ContentModal: ContentModal,
            ModalHeader: ModalHeader,
            ChatOverview: ChatOverview,
            ModalRowButton: ModalRowButton,
            ChatParticipants: ChatParticipants
		}
	});
</script>