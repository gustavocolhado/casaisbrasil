<template>
    <div class="block">
		<div v-bind:class="width" class="border border-bord-pr bg-bg-pr rounded-2xl">
			<slot></slot>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			width: {
				type: String,
				default: 'w-content',
			}
		},
	});
</script>