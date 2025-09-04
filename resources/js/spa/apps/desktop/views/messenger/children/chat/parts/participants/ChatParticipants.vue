<template>
	<div class="block">
		<div class="mb-2 px-4">
			<h4 class="text-lab-pr text-par-m tracking-tighter font-medium">
				{{ $t('chat.participants') }}
			</h4>
		</div>
		<div v-if="state.isLoading" class="block">
			<div class="flex-center h-24">
				<PrimarySpinAnimation></PrimarySpinAnimation>
			</div>
		</div>
		<div v-else>
			<div class="block">
				<ParticipantItem v-for="participantData in chatParticipants" v-bind:participantData="participantData"></ParticipantItem>
			</div>
			<div v-if="chatParticipants.length == 7" class="block px-4">
				<a href="#" class="marginal-link" v-on:click="$comingSoon">
					{{ $t('chat.show_all_participants') }}
				</a>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, onMounted, computed, reactive } from 'vue';
	import { useChatStore } from '@D/store/chats/chat.store.js';
	import ParticipantItem from '@D/views/messenger/children/chat/parts/participants/ParticipantItem.vue';

	export default defineComponent({
		setup: function (props, context) {
			const state = reactive({
                isLoading: true
            });

			const chatStore = useChatStore();
			const chatParticipants = computed(() => {
                return chatStore.chatParticipants;
            });

            onMounted(async () => {
                try {
                    await chatStore.fetchChatParticipants();

                    state.isLoading = false;
                } catch (error) {
                    alert(error);
                }
            });

			return {
				chatParticipants: chatParticipants,
				state: state
			};
		},
		components: {
			ParticipantItem: ParticipantItem
		}
	});
</script>