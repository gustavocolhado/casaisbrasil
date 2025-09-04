<template>
	<div class="w-full flex items-center overflow-hidden px-4 py-1 hover:bg-fill-qt border-b border-b-bord-pr last:border-none"
		v-bind:class="[itemColor, (loading ? 'cursor-wait opacity-70' : 'cursor-pointer'), (disabled ? 'cursor-not-allowed opacity-70' : '')]">
		<span class="py-2 block text-par-n flex-1 truncate mr-2">
			{{ textLabel }}
		</span>
		<div v-if="loading" class="shrink-0 pr-3 leading-zero">
			<div class="colibri-primary-animation"></div>
		</div>
		<span v-else class="shrink-0 size-icon-small">
			<SvgIcon v-bind:type="iconType" v-bind:name="iconName" classes="size-full"></SvgIcon>
		</span>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';

	export default defineComponent({
		props: {
			iconType: {
				type: String,
				default: 'line'
			},
			iconName: {
				type: String,
				default: ''
			},
			textLabel: {
				type: String,
				default: ''
			},
			itemColor: {
				type: String,
				default: 'text-lab-pr2'
			},
			loading: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			}
		}
	});
</script>