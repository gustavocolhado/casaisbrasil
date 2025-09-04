<template>
	<div class="block">
		<p class="text-par-n text-lab-pr2 tracking-tight" v-html="mdInlineRenderer(commentContent)"></p>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import { mdInlineRenderer } from '@/kernel/helpers/md/index.js';

	export default defineComponent({
		props: {
			commentContent: {
				type: String,
				required: true
			}
		},
		setup: function(props, context) {
			return {
				mdInlineRenderer: mdInlineRenderer
			};
		}
	});
</script>