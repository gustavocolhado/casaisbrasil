<template>
    <div class="w-full rounded-b-2xl border-t border-bord-pr px-4 py-2 items-center justify-center flex overflow-hidden">
        <div class="shrink-0">
            <h4 class="text-lab-pr text-cap-s leading-none">
                {{ $t('labels.audio_processing') }}
            </h4>
        </div>
        <div class="ml-6">
            <PrimaryDotsAnimation></PrimaryDotsAnimation>
        </div>
    </div>
</template>

<script>
    import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
    import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { useTimelineStore } from '@D/store/timeline/timeline.store.js';
    import { useI18n } from 'vue-i18n';
    import BRD from '@/kernel/websockets/brd/index.js';

    export default defineComponent({
        props: {
            mediaItem: {
                type: Object,
                default: {}
            }
        },
        setup: function(props) {
            const { t } = useI18n();

            const toastNotifier = new ToastNotifier();
            const timelineStore = useTimelineStore();
            const authStore = useAuthStore();
            const mediaItem = ref(props.mediaItem);

            const userId = authStore.userData.id;

            onMounted(() => {
                if(window.ColibriBRD) {
                    ColibriBRD.private(BRD.getChannel('AUTH_USER', [userId])).listen(BRD.getEvent('TIMELINE_MEDIA_PROCESSED'), function (event) {
                        if(event.data.post_id == mediaItem.value.post_id) {
                            timelineStore.setPostMedia(event.data);
                            
                            toastNotifier.notifyShort(t('toast.media.post_published'));
                        }
                    });
                }
            });

            onUnmounted(() => {
                if(window.ColibriBRD) {
                    ColibriBRD.private(BRD.getChannel('AUTH_USER', [userId])).stopListening(BRD.getEvent('TIMELINE_MEDIA_PROCESSED'));
                }
            });

            return {
                mediaItem: mediaItem
            }
        },
        components: {
        }
    });
</script>