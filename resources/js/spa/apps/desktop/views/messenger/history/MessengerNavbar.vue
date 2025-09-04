<template>
    <SidebarContainer>
        <template v-slot:sidebarTitle>
            <div class="px-4 mb-4">
                <PageTitle v-bind:hasBack="true" v-bind:backHome="true" v-bind:titleText="$t('labels.messages')"></PageTitle>
            </div>

            <div v-if="! isWSEstablished" class="mb-4">
                <WSConnectionAlert></WSConnectionAlert>
            </div>
        </template>

        <template v-slot:sidebarBody>
            <div v-if="state.isLoading" class="block">
                <ChatItemSkeleton v-for="i in 7"></ChatItemSkeleton>
            </div>
            <div v-else class="block">
                <template v-if="isEmptyInbox">
                    <div class="py-80 text-center">
                        <p class="text-par-s tracking-tighter text-lab-sc">
                            {{  $t('chat.no_chat_history') }}
                        </p>
                    </div>
                </template>
                <template v-else>
                    <div class="px-4 border-b border-b-bord-pr pb-4">
                        <QuickSearch v-on:cancelsearch="handleSearchCancel" v-model.lazy="chatsSearchQuery" v-bind:placeholder="$t('chat.search')"></QuickSearch>
                    </div>
                    <template v-if="isSearching">
                        <ChatItem v-if="searchResults.length" v-for="chatData in searchResults" v-bind:chatData="chatData"></ChatItem>

                        <div v-else class="py-80 text-center">
                            <p class="text-par-s tracking-tighter text-lab-sc">
                                {{  $t('chat.no_chats_found') }}
                            </p>
                        </div>
                    </template>
                    <template v-else>
                        <ChatItem v-for="chatData in chatsHistory" v-bind:chatData="chatData"></ChatItem>
                    </template>
                </template>
            </div>
        </template>
    </SidebarContainer>
</template>

<script>
    import { defineComponent, onMounted, ref, computed, reactive, watch } from 'vue';
    import { useInboxStore } from '@D/store/chats/inbox.store.js';

    import PageTitle from '@D/components/layout/PageTitle.vue';
    import SidebarContainer from '@D/components/general/contextual-sidebar/SidebarContainer.vue';
    import ChatItemSkeleton from '@D/views/messenger/history/parts/ChatItemSkeleton.vue';
    import ChatItem from '@D/views/messenger/history/parts/ChatItem.vue';
    import WSConnectionAlert from '@D/views/messenger/history/parts/WSConnectionAlert.vue';
    import FluidEmptyState from '@D/components/page-states/empty/FluidEmptyState.vue';
    import QuickSearch from '@D/components/general/search/QuickSearch.vue';

    export default defineComponent({
        setup: function() {
            const state = reactive({
                isLoading: false
            });

            const chatsSearchQuery = ref('');
            const inboxStore = useInboxStore();
            const searchResults = ref([]);
            const chatsHistory = computed(() => {
                return inboxStore.chatsHistory;
            });
            
            const isSearching = computed(() => {
                return chatsSearchQuery.value.length > 0;
            });

            watch(chatsSearchQuery, (queryValue) => {
                searchResults.value = chatsHistory.value.filter((item) => {
                    if(item.chat_info.name.toLowerCase().includes(queryValue.toLowerCase())) {
                        return true;
                    }
                });
            });

            onMounted(async () => {
                state.isLoading = true;

                if(inboxStore.chatsHistory.length === 0) {
                    await inboxStore.fetchChatsHistory();
                }

                state.isLoading = false;
            });

            return {
                state: state,
                isSearching: isSearching,
                chatsHistory: chatsHistory,
                searchResults: searchResults,
                chatsSearchQuery: chatsSearchQuery,
                isEmptyInbox: computed(() => {
                    return chatsHistory.value.length === 0;
                }),
                isWSEstablished: computed(() => {
                    return (window.ColibriBRConnected !== false);
                }),
                handleSearchCancel: () => {
                    chatsSearchQuery.value = '';
                    searchResults.value = [];
                }
            }
        },
        components: {
            PageTitle: PageTitle,
            SidebarContainer: SidebarContainer,
            ChatItem: ChatItem,
            ChatItemSkeleton: ChatItemSkeleton,
            FluidEmptyState: FluidEmptyState,
            WSConnectionAlert: WSConnectionAlert,
            QuickSearch: QuickSearch
        }
    });
</script>