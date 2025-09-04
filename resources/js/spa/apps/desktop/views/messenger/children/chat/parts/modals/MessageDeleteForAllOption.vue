<template>
	<div class="block px-4 py-3">
		<Checkbox v-model="payloadData.deleteMessage.delete_for_all" v-bind:label="$t('chat.delete_message_for_all')"></Checkbox>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import Checkbox from '@D/components/inter-ui/checkbox/Checkbox.vue';
	import { useChatStore } from '@D/store/chats/chat.store.js';

	export default defineComponent({
		setup: function () {
			const chatsStore = useChatStore();

			return {
				payloadData: chatsStore.payloadData
			};
		},
		components: {
			Checkbox: Checkbox
		}
	});
</script>