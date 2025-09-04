<template>
	<div v-bind:class="[height, bg, opacity]"></div>
</template>
<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			height: {
				type: String,
				default: 'h-px'
			},
			bg: {
				type: String,
				default: 'bg-fill-tr'
			},
			opacity: {
				type: String,
				default: 'opacity-100'
			}
		}
	});
</script>