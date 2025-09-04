<template>
	<a v-bind:href="mediaItem.url + link" target="_blank" class="block px-3 py-2 border-b border-fill-sc hover:bg-fill-qt">
		<div class="flex items-center">
			<div class="shrink-0">
				<div class="inline-flex-center size-8 rounded-full bg-fill-pr">
					<SvgIcon v-bind:name="mediaItem.icon" type="social" classes="size-icon-small text-lab-pr"></SvgIcon>
				</div>
			</div>
			<span class="text-lab-pr ml-2 font-normal text-par-s">
				{{  mediaItem.name }}
			</span>
			<span class="shrink-0 ml-auto">
				<SvgIcon name="chevron-right" type="solid" classes="size-4 text-lab-sc"></SvgIcon>
			</span>
		</div>
	</a>
</template>

<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			mediaItem: {
				type: Object,
				required: true
			},
			link: {
				type: String,
				required: true
			}
		}
	});
</script>