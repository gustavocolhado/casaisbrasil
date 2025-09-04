<template>
    <div class="block leading px-4 pt-3 relative">
        <div class="block pb-3">
            <div class="mb-3">
                <h4 class="text-par-n font-medium text-lab-pr2 truncate tracking-tighter">
                    {{ userData.name }} <VerificationBadge v-if="userData.verification.status" size="xs"></VerificationBadge>
                </h4>
            </div>
            <div class="flex mb-3">
                <div class="shrink-0">
                    <div class="size-small-avatar rounded-full overflow-hidden">
                        <img class="w-full" v-bind:src="userData.avatar_url" alt="Avatar">
                    </div>
                </div>
                <div class="flex-1 ml-2">
                    <textarea
                        readonly="true"
                        v-on:focus="openPostEditorModal(PostType.TEXT)"
                        class="resize-none w-full leading-5 bg-transparent text-par-m px-1 outline-hidden placeholder:font-light placeholder:text-lab-sc placeholder:text-par-l" 
                    v-bind:placeholder="$t('editor.post_text_input_placeholder')"></textarea>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div class="shrink-0 flex-1">
                    <div class="flex items-center gap-2">
                        <MediaCreateButton 
                            v-on:click="openPostEditorModal(PostType.IMAGE)" 
                        iconName="image-01"></MediaCreateButton>

                        <MediaCreateButton 
                            v-on:click="openPostEditorModal(PostType.VIDEO)"
                        iconName="video-recorder"></MediaCreateButton>

                        <MediaCreateButton
                            v-on:click="openPostEditorModal(PostType.AUDIO)"
                        iconName="music-note-01"></MediaCreateButton>

                        <MediaCreateButton
                            v-on:click="openPostEditorModal(PostType.DOCUMENT)"
                        iconName="file-attachment-01"></MediaCreateButton>

                        <MediaCreateButton
                            v-on:click="openPostEditorModal(PostType.POLL)"
                        iconName="bar-chart-12"></MediaCreateButton>

                        <MediaCreateButton
                            v-on:click="openPostEditorModal(PostType.RECORDING)"
                        iconName="recording-02"></MediaCreateButton>

                        <MediaCreateButton
                            v-on:click="openPostEditorModal(PostType.GIF)"
                        iconName="gif"></MediaCreateButton>
                        
                        <MediaCreateButton
                            v-on:click="openCheatSheetPanel"
                        iconName="type-01"></MediaCreateButton>
                    </div>
                </div>
                <div class="shrink-0">
                    <RouterLink v-bind:to="{ name: 'live_stream_page' }">
                        <PrimaryTextButton v-bind:buttonText="$t('labels.live_stream')" buttonRole="marginal">
                            <template v-slot:buttonIcon>
                                <SvgIcon type="line" name="signal-01" classes="size-full"></SvgIcon>
                            </template>
                        </PrimaryTextButton>
                    </RouterLink>
                </div>
            </div>
        </div>
        <div class="absolute top-2 right-2.5">
            <PrimaryIconButton v-on:click="openPublicationAIModal" iconName="ai-icon" buttonColor="text-lab-tr" iconSize="icon-small"></PrimaryIconButton>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed } from 'vue';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { PostType } from '@/kernel/enums/post/post.type.js';
    import { useCheatSheet } from '@D/core/composables/cheat-sheet/index.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';

    import DropdownButton from '@D/components/general/dropdowns/parts/DropdownButton.vue';
    import MediaCreateButton from '@D/components/timeline/editor/buttons/MediaCreateButton.vue';
    import PrimaryTextButton from '@D/components/inter-ui/buttons/PrimaryTextButton.vue';
    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';
    import DropdownMenu from '@D/components/general/dropdowns/parts/DropdownMenu.vue';
    import DropdownMenuItem from '@D/components/general/dropdowns/parts/DropdownMenuItem.vue';

    export default defineComponent({
        setup: function() {
            const authStore = useAuthStore(); 
            const { openCheatSheetPanel } = useCheatSheet();

            const userData = computed(() => {
                return authStore.userData;
            });

            return {
                userData: userData,
                openPostEditorModal: (initialType = PostType.TEXT) => {
                    colibriEventBus.emit('post-editor:open', {
                        initialType: initialType
                    });

                    colibriEventBus.emit('post-ai-editor:close');
                },
                PostType: PostType,
                openCheatSheetPanel: openCheatSheetPanel,
                openPublicationAIModal: () => {
                    colibriEventBus.emit('post-ai-editor:open');
                    colibriEventBus.emit('post-editor:close');
                }
            };
        },
        components: {
            MediaCreateButton: MediaCreateButton,
            PrimaryTextButton: PrimaryTextButton,
            DropdownButton: DropdownButton,
            DropdownMenu: DropdownMenu,
            DropdownMenuItem: DropdownMenuItem,
            PrimaryIconButton: PrimaryIconButton
        }
    });
</script>