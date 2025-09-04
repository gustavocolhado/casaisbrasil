<template>
	<div class="block">
		<div class="mb-2">
			<h3 class="text-lab-sc font-medium text-par-s">
				{{ listTitle }}
			</h3>
		</div>

		<div class="block">
			<slot></slot>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			listTitle: {
				type: String,
				default: ''
			}
		}
	});
</script>