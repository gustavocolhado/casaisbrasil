<template>
    <Backdrop>
        <div v-bind:class="[isCentered ? 'flex justify-center' : 'ml-page-offset']">
            <div class="py-top-offset">
                <PrimaryTransition>
                    <div v-if="renderModal" v-bind:class="[hasBorder ? 'border border-bord-pr' : '']" class="popup-background-sc w-content rounded-xl origin-top">
                        <div class="block">
                            <slot></slot>
                        </div>
                    </div>
                </PrimaryTransition>
                
                <template v-if="renderModal == false">
                    <template v-if="($slots['loadingSkeleton'] !== undefined)">
                        <div class="popup-background-tr w-content rounded-md">
                            <slot name="loadingSkeleton"></slot>
                        </div>
                    </template>
                </template>
            </div>
        </div>
        <Teleport to="body" v-if="!hideAuthorAttribution">
            <ColibriPlusAttribution></ColibriPlusAttribution>
        </Teleport>  
    </Backdrop>
</template>


<script>
    import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';

    import { useRoute } from 'vue-router';
    
    import ColibriPlusAttribution from '@D/components/attributions/ColibriPlusAttribution.vue';
    import Backdrop from '@D/components/general/modals/Backdrop.vue';

    export default defineComponent({
        setup: function(props, context) {
            const renderModal = ref(false);
            const route = useRoute();

            onMounted(() => {
                setTimeout(() => {
                    renderModal.value = true;
                }, 200);

                document.body.classList.add('overflow-hidden');
            });

            onUnmounted(() => {
                document.body.classList.remove('overflow-hidden');
            });
            
            return {
                renderModal: renderModal,
                hasBorder: (embedder('theme') == 'dark'),
                isCentered: computed(() => {
                    if(route.meta.fluidLayout) {
                        return true;
                    }

                    return false;
                }),
                hideAuthorAttribution: window.HIDE_AUTHOR_ATTRIBUTION
            }
        },
        components: {
            ColibriPlusAttribution: ColibriPlusAttribution,
            Backdrop: Backdrop
        }
    });
</script>