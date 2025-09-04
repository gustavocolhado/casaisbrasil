<template>
    <div class="flex">
        <div v-bind:class="[isPortrait ? 'w-72' : 'w-full']"
        class="bg-fill-pr block border border-edge-pr rounded-xl overflow-hidden relative">
            <img v-bind:src="mediaItem.thumbnail_url" class="h-full" alt="Video thumbnail">
            <div class="from-black/60 to-transparent bg-gradient-to-t absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6">
                <div class="flex items-center justify-between">
                    <span class="text-white text-cap-s leading-none animate-pulse animate-ease-in-out animate-infinite">
                        {{ $t('labels.video_processing') }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed, onMounted, onUnmounted } from 'vue';
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
            },
            isPortrait: {
                type: Boolean,
                default: false
            }
        },
        setup: function(props) {
            const { t } = useI18n();

            const toastNotifier = new ToastNotifier();
            const timelineStore = useTimelineStore();
            const authStore = useAuthStore();
            const mediaItem = computed(() => {
                return props.mediaItem;
            });

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