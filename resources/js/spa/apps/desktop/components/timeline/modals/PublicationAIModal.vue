<template>
    <ContentModal v-if="state.isOpen">
		<form v-on:submit.prevent="submitForm">
			<div class="max-w-full flex justify-between overflow-hidden py-3.5 px-4">
				<h4 class="text-par-s font-medium flex-1 text-lab-pr2 tracking-tighter truncate mr-4">
					{{ ME.name }}
				</h4>
				<ModalCloseButton v-on:click="closeEditor" type="button" class="text-par-s text-brand-900 cursor-pointer"></ModalCloseButton>
			</div>
			<div class="block px-4 mb-4">
				<h3 class="text-par-l font-bold text-lab-pr2 tracking-tighter text-center">
					{{ $t('editor.post_ai_generated_title') }}
				</h3>
				<p class="text-par-s font-medium text-lab-sc tracking-tighter text-center">
					{{ $t('editor.post_ai_generated_description') }}
				</p>
			</div>
			<div class="p-4">
				<div class="flex items-end bg-fill-qt rounded-xl border border-bord-tr relative">
					<textarea
						ref="promptTextInputField"
						v-on:input="textInputHandler"
						v-model="promptData.content"
						class="resize-none w-full pl-4 pr-12 leading-5 pt-3 bg-transparent text-par-n text-lab-pr2 max-h-96 overflow-y-auto min-h-20 outline-hidden placeholder:font-light placeholder:text-par-m" 
					v-bind:placeholder="$t('editor.post_ai_generated_placeholder')"></textarea>
					<div class="absolute right-1.5 bottom-1.5">
						<PrimaryIconButton v-on:click="$comingSoon" v-bind:disabled="! isFormValid && false" buttonColor="text-brand-900" iconName="send-03" iconSize="icon-normal" buttonType="button"></PrimaryIconButton>
					</div>
				</div>
			</div>
			<div class="pt-2 pb-3 px-4 border-t border-bord-pr leading-none">
				<span class="text-cap-s font-medium text-brand-900">DeepSeek R1</span>
			</div>
		</form>
    </ContentModal>
</template>

<script>
    import { defineComponent, computed, reactive, onMounted, onUnmounted, ref } from 'vue';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';
	import { useInputHandlers } from '@D/core/composables/input/index.js';

    import ContentModal from '@D/components/general/modals/ContentModal.vue';
    import ModalHeader from '@D/components/general/modals/parts/ModalHeader.vue';
	import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';
	import ModalCloseButton from '@D/components/general/modals/parts/buttons/ModalCloseButton.vue';

    export default defineComponent({
        setup: function() {
            const state = reactive({
                isOpen: false
            });

			const { autoResize } = useInputHandlers();
            const authStore = useAuthStore();
            const userData = computed(() => {
                return authStore.userData;
            });

			const promptData = reactive({
				content: ''
			});

			const textInputHandler = function() {
				autoResize(promptTextInputField.value);
			}

			const promptTextInputField = ref(null);

            const openEditor = (data) => {
                state.isOpen = true;
            };

            const closeEditor = (data) => {
                state.isOpen = false;
            };

            onMounted(() => {
                colibriEventBus.on('post-ai-editor:open', openEditor);
                colibriEventBus.on('post-ai-editor:close', closeEditor);
            });

            onUnmounted(() => {
                colibriEventBus.off('post-ai-editor:open', openEditor);
                colibriEventBus.off('post-ai-editor:close', closeEditor);
            });

			const submitForm = () => {
				console.log('Good to go! But this feature is not implemented yet. Mansur is working on it. Please wait for the next update.');
			};

            return {
                state: state,
				promptData: promptData,
				promptTextInputField: promptTextInputField,
                ME: {
                    name: userData.value.name
                },
                closeEditor: closeEditor,
				submitForm: submitForm,
				textInputHandler: textInputHandler,
				isFormValid: computed(() => {
					return promptData.content.trim().length > 0;
				})
            };
        },
        components: {
            ContentModal: ContentModal,
            ModalHeader: ModalHeader,
			PrimaryIconButton: PrimaryIconButton,
			ModalCloseButton: ModalCloseButton
        }
    });
</script>