<template>
	<template v-if="state.isModalOpen">
		<ContentModal>
			<div class="block">
				<div class="p-4">
					<div class="px-4 py-3">
						<h4 class="text-par-l text-center text-lab-pr2 font-semibold tracking-tighter" v-html="modalData.title"></h4>
						<p class="text-par-s text-center text-lab-pr2" v-html="modalData.description"></p>
					</div>
				</div>
				<template v-if="slotComponent">
					<div class="block">
						<Component v-bind:is="slotComponent"></Component>
					</div>
				</template>
				<div class="border-t border-bord-pr">
					<div class="grid grid-cols-2">
						<div class="flex py-4 justify-center">
							<PrimaryTextButton v-on:click="cancel" v-bind:buttonText="modalData.cancel"></PrimaryTextButton>
						</div>
						<div class="flex py-4 justify-center border-l border-bord-pr">
							<PrimaryTextButton v-on:click="confirm" v-bind:buttonText="modalData.confirm" buttonRole="danger"></PrimaryTextButton>
						</div>
					</div>
				</div>
			</div>
		</ContentModal>
	</template>
</template>

<script>
	import { defineComponent, reactive, shallowRef, markRaw, ref, onMounted } from 'vue';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';
	import { useI18n } from 'vue-i18n';
	import ContentModal from '@D/components/general/modals/ContentModal.vue';
	import PrimaryTextButton from '@D/components/inter-ui/buttons/PrimaryTextButton.vue';

	export default defineComponent({
		setup: function(props) {
			const state = reactive({
				isModalOpen: false,
			});

			const { t } = useI18n();
			const slotComponent = shallowRef(null);
			const modalData = ref({});

			const modalCallbacks = reactive({
				onConfirm: null,
				onCancel: null
			});

			const resetModalData = () => {
				modalData.value = {
					title: '',
					description: '',
					confirm: t('prompt.confirm_prompt_button'),
					cancel: t('prompt.cancel_prompt_button')
				};
			};

			onMounted(() => {
				colibriEventBus.on('confirmation-modal:open', (data) => {
					resetModalData();

					modalData.value.title = data.title;
					modalData.value.description = data.description;
					
					slotComponent.value = data.slotComponent ? markRaw(data.slotComponent) : null;

					if (data.confirmButtonText) {
						modalData.value.confirm = data.confirmButtonText;
					}

					if (data.cancelButtonText) {
						modalData.cancel = data.cancelButtonText;
					}

					modalCallbacks.onConfirm = data.onConfirm;
					modalCallbacks.onCancel = data.onCancel;

					state.isModalOpen = true;
				});
			});

			return {
				modalData: modalData,
				modalCallbacks: modalCallbacks,
				state: state,
				slotComponent: slotComponent,
				confirm: function() {
					if(modalCallbacks.onConfirm) {
						modalCallbacks.onConfirm();
					}

					state.isModalOpen = false;
				},
				cancel: function() {
					if(modalCallbacks.onCancel) {
						modalCallbacks.onCancel();
					}

					state.isModalOpen = false;
				}
			};
		},
		components: {
			ContentModal: ContentModal,
			PrimaryTextButton: PrimaryTextButton
		}
	});
</script>