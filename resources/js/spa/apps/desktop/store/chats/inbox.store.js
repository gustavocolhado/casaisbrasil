import { defineStore } from 'pinia';
import { colibriAPI } from '@/kernel/services/api-client/native/index.js';

const useInboxStore = defineStore('chats_inbox', {
    state: () => {
        return {
            chatsHistory: [],
            unreadCount: {
				formatted: 0,
				raw: 0
			},
        };
    },
    actions: {
        fetchChatsHistory: async function() {
            let state = this;

            await colibriAPI().messenger().getFrom('chats').then(function(response) {
                state.chatsHistory = response.data.data;
            }).catch(function(error) {
                state.chatsHistory = [];
            });
        },
        fetchUnreadCount: function() {
			colibriAPI().messenger().getFrom('unread/count').then((response) => {
				this.unreadCount = response.data.data;
			}).catch(() => {
				this.unreadCount = {
					formatted: 0,
					raw: 0
				};
			});
		},
        removeChatFromHistory: function(chatId) {
            let state = this;

            let chatIndex = state.chatsHistory.findIndex((item) => {
                return item.chat_id == chatId;
            });

            if(chatIndex !== -1) {
                state.chatsHistory.splice(chatIndex, 1);
            }
        }
    }
});

export { useInboxStore };