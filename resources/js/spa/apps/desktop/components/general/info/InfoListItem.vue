<template>
	<div class="flex gap-3 leading-none mb-5">
		<div class="shrink-0 w-6 text-lab-pr2">
			<SvgIcon v-bind:name="iconName" v-bind:type="iconType"></SvgIcon>
		</div>
		<div class="flex-1 text-par-s">
			<h5 class="font-medium text-lab-pr mb-1">
				{{ labelText }}
			</h5>
			<p class="text-lab-sc">
				{{ contentText }}
			</p>
		</div>
		<div v-if="isCopyable" class="shrink-0 text-lab-pr2">
			<PrimaryIconButton
				v-if="copied"
				iconName="check-circle"
				buttonColor="text-green-500"
				iconType="solid"
			iconSize="icon-small"></PrimaryIconButton>
			<PrimaryIconButton
				v-else
				iconName="copy-06"
				iconType="line"
				iconSize="icon-small"
			v-on:click="copyContent"></PrimaryIconButton>
		</div>
	</div>
</template>

<script>
	import { defineComponent, ref } from 'vue';
	import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';

	export default defineComponent({
		props: {
			labelText: {
				type: String,
				default: ''
			},
			isCopyable: {
				type: Boolean,
				default: false
			},
			contentText: {
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
		},
		setup: function (props) {
			const copied = ref(false);

			return { 
				copied: copied,
				copyContent: () => {
					navigator.clipboard.writeText(props.contentText).then(() => {
						copied.value = true;

						setTimeout(() => {
							copied.value = false;
						}, 2000);
					});
				}
			};
		},
		components: {
			PrimaryIconButton: PrimaryIconButton
		}
	});
</script>