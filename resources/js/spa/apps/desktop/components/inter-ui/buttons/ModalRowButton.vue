<template>
	<div class="block">
		<button 
			v-bind:type="buttonType" 
			class="flex w-full items-center py-4 px-4 hover:bg-fill-qt gap-2 overflow-hidden"
		v-bind:class="[buttonTextColors[buttonRole]]">
			<span class="size-icon-small shrink-0">
				<SvgIcon v-bind:name="iconName" v-bind:type="iconType" classes="size-icon-small"></SvgIcon>
			</span>
			<span class="text-par-s truncate">
				{{ buttonText }}
			</span>
			<span v-if="hasArrow" class="size-icon-small shrink-0 ml-auto">
				<SvgIcon name="chevron-right" type="solid" classes="size-icon-small"></SvgIcon>
			</span>
		</button>
	</div>
</template>

<script>
	import { defineComponent, ref } from 'vue';

	export default defineComponent({
		props: {
			buttonText: {
                type: String,
                default: 'Label'
            },
            buttonType: {
                type: String,
                default: 'button'
            },
			iconName: {
                type: String,
                default: 'x' 
            },
            iconType: {
                type: String,
                default: 'line' 
            },
			buttonRole: {
                type: String,
                default: 'default'
            },
			hasArrow: {
				type: Boolean,
				default: false
			}
		},
		setup(props, context) {
			const buttonTextColors = {
                default: ['text-lab-pr2'],
                danger: ['text-red-900']
            };

			return {
				buttonTextColors: buttonTextColors
			};
		}
	});
</script>