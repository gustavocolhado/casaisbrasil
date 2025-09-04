<template>
	<Backdrop>
		<div class="w-navbar popup-background-sc fixed top-0 bottom-0 right-0 pt-4">
			<div class="flex flex-col h-full">
				<div class="px-4 flex items-center justify-between">
					<h4 class="text-par-l tracking-tighter font-medium text-lab-pr">
						{{ $t('labels.filters') }}
					</h4>
					<div class="shrink-0">
						<ModalCloseButton v-on:click="$emit('close')"></ModalCloseButton>
					</div>
				</div>
				<div class="overflow-y-auto flex-1">
					<slot></slot>
				</div>
				<template v-if="$slots.fixedFooter">
					<slot name="fixedFooter"></slot>
				</template>
			</div>
		</div>
	</Backdrop>
</template>

<script>
	import { defineComponent } from 'vue';

	import Backdrop from '@D/components/general/modals/Backdrop.vue';
	import ModalCloseButton from '@D/components/general/modals/parts/buttons/ModalCloseButton.vue';

	export default defineComponent({
		emits: ['close'],
		components: {
			Backdrop: Backdrop,
			ModalCloseButton: ModalCloseButton
		}
	});
</script>