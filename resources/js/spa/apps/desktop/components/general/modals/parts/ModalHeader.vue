<template>
    <div class="block leading-none">
        <div class="max-w-full overflow-hidden px-4 py-4 relative">
            <h4 class="text-par-l px-16 font-semibold text-center flex-1 text-lab-pr2 tracking-tighter truncate mr-4">
                {{ modalTitle }}
            </h4>
            <div class="absolute top-0 right-0 h-full flex items-center z-10 px-4">
                <ModalCloseButton v-if="hasDismissButton" v-on:click="$emit('close')" type="button" class="text-par-s text-brand-900 cursor-pointer"></ModalCloseButton>
            </div>
        </div>
        <div v-if="hasTitleDivider" class="h-px bg-fill-pr"></div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import ModalCloseButton from '@D/components/general/modals/parts/buttons/ModalCloseButton.vue';

    export default defineComponent({
        props: {
            modalTitle: {
                type: String,
                default: ''
            },
            hasDismissButton: {
                type: Boolean,
                default: true
            },
            hasTitleDivider: {
                type: Boolean,
                default: true
            }
        },
        emits: ['close'],
        components: {
            ModalCloseButton: ModalCloseButton
        }
    });
</script>