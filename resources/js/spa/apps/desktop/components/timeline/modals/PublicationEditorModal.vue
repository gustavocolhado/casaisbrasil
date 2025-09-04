<template>
    <ContentModal v-if="state.isOpen">
        <div class="max-w-full flex justify-between overflow-hidden py-3.5 px-4">
            <h4 class="text-par-s font-medium flex-1 text-lab-pr2 tracking-tighter truncate mr-4">
                {{ ME.name }}
            </h4>
            <ModalCloseButton v-on:click="closeEditor" type="button" class="text-par-s text-brand-900 cursor-pointer"></ModalCloseButton>
        </div>
        <PublicationEditor></PublicationEditor>
    </ContentModal>
</template>

<script>
    import { defineComponent, computed, reactive, onMounted, onUnmounted } from 'vue';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';

    import { usePostEditorStore } from '@D/store/timeline/editor.store.js';

    import ContentModal from '@D/components/general/modals/ContentModal.vue';
    import PublicationEditor from '@D/components/timeline/editor/PublicationEditor.vue';
    import ModalCloseButton from '@D/components/general/modals/parts/buttons/ModalCloseButton.vue';

    export default defineComponent({
        setup: function() {
            const state = reactive({
                isOpen: false
            });

            const postEditorStore = usePostEditorStore();
            const authStore = useAuthStore();
            const userData = computed(() => {
                return authStore.userData;
            });

            const openEditor = (data) => {
                state.isOpen = true;
                
                if(data) {
                    if(data.initialType) {
                        postEditorStore.initialType = data.initialType;
                    }
    
                    if(data.mentionName) {
                        postEditorStore.mentionName = data.mentionName;
                    }
    
                    if(data.quotePostId) {
                        postEditorStore.quotePostId = data.quotePostId;
                    }
                }
            };

            const closeEditor = (data) => {
                state.isOpen = false;

                postEditorStore.finishEditing();
            };

            onMounted(() => {
                colibriEventBus.on('post-editor:open', openEditor);
                colibriEventBus.on('post-editor:close', closeEditor);
            });

            onUnmounted(() => {
                colibriEventBus.off('post-editor:open', openEditor);
                colibriEventBus.off('post-editor:close', closeEditor);
            });

            return {
                state: state,
                ME: {
                    name: userData.value.name
                },
                closeEditor: closeEditor
            };
        },
        components: {
            ContentModal: ContentModal,
            PublicationEditor: PublicationEditor,
            ModalCloseButton: ModalCloseButton
        }
    });
</script>