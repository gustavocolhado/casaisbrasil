<template>
    <div class="overflow-hidden" v-bind:key="mediaItem.id">
        <div class="block border border-bord-card rounded-2xl">
            <div class="px-4 py-3.5">
                <div class="flex justify-between items-center">
                    <div class="shrink-0">
                        <template v-if="MediaStatusUtils.isProcessing(mediaItem.status)">
                            <div class="cursor-not-allowed size-6 rounded-full text-lab-tr smoothing opacity-50">
                                <span class="size-4">
                                    <SvgIcon name="play" classes="size-full"></SvgIcon>
                                </span>
                            </div>
                        </template>
                        <template v-else>
                            <div class="cursor-pointer size-6 rounded-full text-lab-tr hover:text-brand-900 smoothing">
                                <template v-if="playerState" >
                                    <span v-on:click="togglePlay" class="size-4" v-if="playerState.playing">
                                        <SvgIcon name="pause" classes="size-full"></SvgIcon>
                                    </span>
                                    <span  v-on:click="togglePlay" class="size-4" v-else>
                                        <SvgIcon name="play" classes="size-full"></SvgIcon>
                                    </span>
                                </template>
                                <template v-else>
                                    <span v-on:click="addAudio" class="size-4">
                                        <SvgIcon name="play" classes="size-full"></SvgIcon>
                                    </span>
                                </template>
                            </div>
                        </template>
                    </div>
                    <div class="flex-1 leading-none overflow-hidden mx-3">
                        <h4 class="text-lab-pr2 text-par-s font-medium mb-0.5 truncate">
                            {{ mediaItem.metadata.file_name }}
                        </h4>
                        <p class="text-cap-l text-lab-sc">
                            {{ $filters.fileSize(mediaItem.size) }}
                        </p>
                    </div>
                    <div class="text-par-s text-lab-sc shrink-0">
                        {{ $filters.mediaDuration(mediaItem.metadata.duration) }}
                    </div>
                </div>
            </div>
            <template v-if="MediaStatusUtils.isProcessing(mediaItem.status)">
                <PublicationAudioProcessing v-bind:mediaItem="mediaItem" v-bind:key="mediaItem.id"></PublicationAudioProcessing>
            </template>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed, ref, defineAsyncComponent } from 'vue';

    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';

    import { useAudioStore } from '@D/store/audio/audio.store.js';
    import { MediaStatusUtils } from '@/kernel/enums/post/media.status.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';

    export default defineComponent({
        props: {
            postMedia: {
                type: Object,
                default: {}
            }
        },
        setup: function(props) {
            const audioWaveCanvas = ref(null);
            const audioStore = useAudioStore();

            const mediaItem = computed(() => {
                return props.postMedia[0];
            });

            const playerState = computed(() => {
                if (audioStore.postAudioData) {
                    if(audioStore.postAudioData.id === mediaItem.value.id) {
                        return audioStore.playerState;
                    }
                }

                return null;
            });

            return {
                mediaItem: mediaItem,
                playerState: playerState,
                audioWaveCanvas: audioWaveCanvas,
                addAudio: () => {
                    audioStore.add(mediaItem.value);

                    colibriEventBus.emit('soundbar:reinitialize');
                },
                togglePlay: () => {
                    colibriEventBus.emit('soundbar:play');
                },
                MediaStatusUtils: MediaStatusUtils
            }
        },
        components: {
            PrimaryIconButton: PrimaryIconButton,
            PublicationAudioProcessing: defineAsyncComponent(() => {
                return import('@D/components/timeline/feed/parts/media/state/PublicationAudioProcessing.vue');
            })
        }
    });
</script>