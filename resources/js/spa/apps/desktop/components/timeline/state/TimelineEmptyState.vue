<template>
	<div class="block px-4">
		<h4 v-if="title" class="text-par-m font-semibold text-lab-pr2 tracking-tighter text-center">
			{{ title }}
		</h4>
		<p v-if="desc" class="text-par-s text-lab-sc text-center">
			{{ desc }}
		</p>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			title: {
				type: String,
				default: ''
			},
			desc: {
				type: String,
				default: ''
			},
			iconName: {
				type: String,
				default: ''
			},
			iconType: {
				type: String,
				default: 'line'
			}
		}
	});
</script>