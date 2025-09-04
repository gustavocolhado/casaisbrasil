<template>
    <div class="block leading-none"
        v-on:drop.prevent="handleFileDrop"
		v-on:dragenter.prevent="state.isDragging = true"
		v-on:dragover.prevent="state.isDragging = true">
        <form class="block" v-on:submit.prevent="submitForm">
            <div class="block px-4 mb-2">
                <div class="mb-6">
                    <textarea
                        v-on:paste="onMediaPaste"
                        v-on:input="textInputHandler"
                        ref="postTextInputField"
                        v-model="postData.content"
                        class="resize-none w-full leading-5 bg-transparent text-par-n text-lab-pr2 pr-4 outline-hidden placeholder:font-light placeholder:text-par-m pt-0.5" 
                    v-bind:placeholder="postTextInputPlaceholder"></textarea>
                </div>
                <div v-if="isAiGeneratedPost" class="block mb-3">
                    <div class="text-cap-s text-lab-sc font-medium">
                        {{ $t('labels.ai_generated') }}
                    </div>
                </div>
                <MentionsPicker 
                    v-on:select="selectMention" 
                classes="absolute top-0 left-0 w-80 z-50 border border-bord-pr rounded-lg popup-background-tr"></MentionsPicker>
                <template v-if="state.isDragging">
                    <MediaFileDropper v-on:click="state.isDragging = false"></MediaFileDropper>
                </template>
                <template v-else>
                    <div v-if="postHasMedia" class="block mb-3">
                        <template v-if="PostTypeUtils.isImage(postData.type)">
                            <div class="overflow-hidden">
                                <div class="grid grid-cols-3 gap-1">
                                    <div v-for="mediaItem in postMedia" v-bind:key="mediaItem.id" class="relative rounded-md overflow-hidden border border-bord-card">
                                        <MediaBlurOverlay v-if="mediaItem.deleted"></MediaBlurOverlay>

                                        <div v-else class="absolute top-2 right-2 inline-block">
                                            <MediaDeleteButton v-on:click="deletePostMedia(mediaItem)"></MediaDeleteButton>
                                        </div>

                                        <img v-bind:src="mediaItem.source_url" class="w-full aspect-square h-full object-cover bg-fill-tr" alt="Image">
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="PostTypeUtils.isVideo(postData.type)">
                            <PostVideoPreview
                                v-for="mediaItem in postMedia" v-bind:key="mediaItem.id" 
                                v-bind:mediaItem="mediaItem"
                            v-on:delete="deletePostMedia"></PostVideoPreview>
                        </template>
                        <template v-else-if="PostTypeUtils.isGif(postData.type)">
                            <PostGifPreview v-bind:postMedia="postMedia" v-on:deletemedia="deletePostMedia"></PostGifPreview>
                        </template>
                        <template v-else-if="PostTypeUtils.isDocument(postData.type) || PostTypeUtils.isAudio(postData.type)">
                            <PostDocumentPreview v-bind:postMedia="postMedia" v-on:deletemedia="deletePostMedia"></PostDocumentPreview>
                        </template>
                    </div>
                    <div v-else-if="postHasPoll" class="block mb-3">
                        <PostPollForm v-on:remove="deletePostPoll"></PostPollForm>
                    </div>
                    <div v-else-if="postHasLinkSnapshot" class="block mb-3">
                        <PostLinkSnapshotPreview
                            v-bind:key="postLinkSnapshot.id"
                            v-on:delete="deletePostLinkSnapshot"
                        v-bind:linkSnapshot="postLinkSnapshot"></PostLinkSnapshotPreview>
                    </div>
                    <div v-if="postHasQuotedPost" class="block mb-3">
                        <PublicationQuote v-bind:quotedPost="quotedPost" v-bind:key="quotedPost.id"></PublicationQuote>
                    </div>
                    <div class="flex items-center">
                        <div class="flex-1 flex items-center gap-2">
                            <div class="relative">
                                <MediaCreateButton 
                                    v-on:click="selectImage" 
                                    v-bind:disabled="postMediaButtonStatus(PostType.IMAGE)" 
                                iconName="image-01"></MediaCreateButton>
                            </div>
                            <div class="relative">
                                <MediaCreateButton 
                                    v-on:click="selectVideo" 
                                    v-bind:disabled="postMediaButtonStatus(PostType.VIDEO)" 
                                iconName="video-recorder"></MediaCreateButton>
                            </div>
                            
                            <div class="relative">
                                <MediaCreateButton
                                    v-on:click="selectAudio"
                                    v-bind:disabled="postMediaButtonStatus(PostType.AUDIO)" 
                                iconName="music-note-01"></MediaCreateButton>
                            </div>

                            <div class="relative">
                                <MediaCreateButton
                                    v-on:click="selectDocument"
                                    v-bind:disabled="postMediaButtonStatus(PostType.DOCUMENT)" 
                                iconName="file-attachment-01"></MediaCreateButton>
                            </div>

                            <div class="relative">
                                <MediaCreateButton
                                    v-on:click="createPoll"
                                    v-bind:disabled="postMediaButtonStatus(PostType.POLL)" 
                                iconName="bar-chart-12"></MediaCreateButton>
                            </div>

                            <div class="relative">
                                <MediaCreateButton
                                    v-on:click="toggleAudioRecorder('toggle')"
                                    v-bind:disabled="postMediaButtonStatus(PostType.RECORDING)" 
                                iconName="recording-02"></MediaCreateButton>

                                <template v-if="state.openAudioRecorder">
                                    <div class="block absolute top-6 left-0 w-80">
                                        <PostRecordingForm v-on:uploadaudio="onAudioRecorded"></PostRecordingForm>
                                    </div>
                                </template>
                            </div> 
                            <div class="relative">
                                <MediaCreateButton
                                    v-on:click.stop="toggleGifsPicker('toggle')"
                                    v-bind:disabled="postMediaButtonStatus(PostType.GIF)"
                                iconName="gif"></MediaCreateButton>

                                <template v-if="state.openGifsPicker">
                                    <div class="block absolute top-6 left-0 w-80 z-50">
                                        <PostGifForm 
                                            v-on:remove="deletePostGif"
                                            v-on:selectgif="selectGif"
                                        v-on:close="toggleGifsPicker('close')"></PostGifForm>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <div class="ml-auto flex items-center gap-2.5 shrink-0">
                            <div class="relative">
                                <MediaCreateButton v-on:click.stop="toggleEmojisPicker('toggle')" iconName="face-smile"></MediaCreateButton>
                                <template v-if="state.openEmojisPicker">
                                    <div class="block absolute top-6 right-0 w-80 z-50">
                                        <EmojisPicker 
                                            v-on:pickemoji="insertPostEmoji"
                                        v-on:close="toggleEmojisPicker('close')"></EmojisPicker>
                                    </div>
                                </template>
                            </div>
                            <MediaCreateButton v-on:click="openCheatSheetPanel" iconName="type-01"></MediaCreateButton>
                        </div>
                    </div>
                </template>
            </div>
            <div class="py-2.5 px-4 border-t border-bord-pr">      
                <div class="flex justify-between">
                    <PrimaryTextButton buttonType="submit" v-bind:loading="state.postSubmitting" v-bind:buttonText="$t('editor.publish')">
                    </PrimaryTextButton>
                    <div class="shrink-0 flex items-center gap-2">
                        <template v-if="state.postMediaUploadProgress">
                            <span class="inline-flex text-par-s items-center gap-2 text-lab-sc leading-none disabled:opacity-60">
                                <span class="mt-0.5 text-brand-900">{{ $t('labels.uploading') }} <span class="inline-block w-8">{{ state.postMediaUploadProgress }}%</span></span>
                            </span>
                            <span class="w-px h-4 bg-bord-sc"></span>
                        </template>
                        <RouterLink v-bind:to="{ name: 'live_stream_page' }">
                            <PrimaryTextButton buttonText="Live" buttonRole="marginal">
                                <template v-slot:buttonIcon>
                                    <SvgIcon type="line" name="signal-01" classes="size-full"></SvgIcon>
                                </template>
                            </PrimaryTextButton>
                        </RouterLink>
                        <span class="w-px h-4 bg-bord-sc"></span>
                        <div class="shrink-0">
                            <div class="relative">
                                <button type="button" v-on:click.stop="toggleMainDropdown" class="outline-hidden text-lab-sc size-icon-small inline-flex items-center justify-center rounded-full">
                                    <SvgIcon type="line" name="circle-dots"></SvgIcon>
                                </button>
                                <div class="absolute top-full right-0 z-50" v-if="state.isDropdownOpen">
                                    <DropdownMenu v-outside-click="toggleMainDropdown" v-on:click="toggleMainDropdown">
                                        <DropdownMenuItem v-on:click="markPostAsSensitive" iconName="alert-triangle" v-bind:textLabel="(isSensitivePost ? $t('editor.unmark_sensitive') : $t('editor.mark_sensitive'))"></DropdownMenuItem>
                                        <DropdownMenuItem v-on:click="markPostAsAiGenerated" iconName="cpu-chip-02" v-bind:textLabel="(isAiGeneratedPost ? $t('editor.unmark_ai_generated') : $t('editor.mark_ai_generated'))"></DropdownMenuItem>
                                        <a v-bind:href="$link('guide_links.publication_rules')" target="_blank">
                                            <DropdownMenuItem
                                                iconName="arrow-up-right"
                                            v-bind:textLabel="$t('editor.publication_guidelines')"></DropdownMenuItem>
                                        </a>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="hidden">
                <input v-on:change="onImageSelect" type="file" capture="user" accept="image/*" ref="postImageFileInput">
                <input v-on:change="onVideoSelect" type="file" capture="user" accept="video/*" ref="postVideoFileInput">
                <input v-on:change="onDocumentSelect" type="file" capture="user" ref="postDocumentFileInput">
                <input v-on:change="onAudioSelect" type="file" capture="user" accept="audio/*" ref="postAudioFileInput">
            </div>
        </form>
        <SensitivePostTape v-if="isSensitivePost"></SensitivePostTape>
    </div>
</template>

<script>
    import { defineComponent, defineAsyncComponent, onMounted, ref, reactive, computed, nextTick } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { PostTypeUtils, PostType } from '@/kernel/enums/post/post.type.js';
    
    import { colibriAPI } from '@/kernel/services/api-client/native/index.js';
    import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
    import { colibriEventBus } from '@/kernel/events/bus/index.js';
    import { imagePasteHandler } from '@/kernel/events/image-paste/index.js';
    import { useCheatSheet } from '@D/core/composables/cheat-sheet/index.js';
    import { useInputHandlers } from '@D/core/composables/input/index.js';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { useTimelineStore } from '@D/store/timeline/timeline.store.js';
    import { usePostEditorStore } from '@D/store/timeline/editor.store.js';

    import DropdownButton from '@D/components/general/dropdowns/parts/DropdownButton.vue';
    
    import PrimaryTextButton from '@D/components/inter-ui/buttons/PrimaryTextButton.vue';
    import MediaCreateButton from '@D/components/timeline/editor/buttons/MediaCreateButton.vue';
    
    import MentionsPicker from '@D/components/mentions/MentionsPicker.vue';
    import DropdownMenu from '@D/components/general/dropdowns/parts/DropdownMenu.vue';
    import DropdownMenuItem from '@D/components/general/dropdowns/parts/DropdownMenuItem.vue';

    export default defineComponent({
        setup: function(props, context) {
            const postImageFileInput = ref(null);
            const postDocumentFileInput = ref(null);
            const postVideoFileInput = ref(null);
            const postAudioFileInput = ref(null);
            const postTextInputField = ref('');
            const ignoredLinkSnapshots = ref([]);

            const { openCheatSheetPanel } = useCheatSheet();
            const { autoResize, insertSymbolAtCaret, matchMention, matchLink, completeText } = useInputHandlers();
            
            const { t } = useI18n();
            const authStore = useAuthStore();
            const timelineStore = useTimelineStore();
            const postEditorStore = usePostEditorStore();
            const toastNotifier = new ToastNotifier();
            const userData = computed(() => {
                return authStore.userData;
            });

            const postData = computed(() => {
                return postEditorStore.draftPost;
            });

            const state = reactive({
                postSubmitting: false,
                postMediaUploadProgress: 0,
                openGifsPicker: false,
                openAudioRecorder: false,
                openEmojisPicker: false,
                isDropdownOpen: false,
                isDragging: false,
                isLinkPreviewing: false,
                isFetchingLinkPreview: false
            });

            const textInputHandler = function() {
                const mentionMatch = matchMention(postTextInputField.value);

                if(mentionMatch) {
                    colibriEventBus.emit('editor:mention-input', mentionMatch.username);
                }

                if(! state.isLinkPreviewing && ! state.isFetchingLinkPreview) {
                    const linkMatch = matchLink(postTextInputField.value);
                    
                    if(PostTypeUtils.isText(postData.value.type) && linkMatch && ! ignoredLinkSnapshots.value.includes(linkMatch)) {
                        // If the link has already been previewed and ignored, don't preview it again
                        // This is to prevent spamming the API with the same link over and over

                        state.isFetchingLinkPreview = true;

                        colibriAPI().postEditor().with({
                            url: linkMatch
                        }).sendTo('link/preview').then((response) => {

                            // Using nextTick to ensure reactivity updates are processed
                            nextTick(() => {
                                postEditorStore.setLinkSnapshot(response.data.data);
                            });

                            state.isLinkPreviewing = true;
                            state.isFetchingLinkPreview = false;
                        }).catch((error) => {
                            state.isLinkPreviewing = false;
                            state.isFetchingLinkPreview = false;
                        });
                    }
                }

                autoResize(postTextInputField.value);
            }

            const resetFileInputTags = () => {
                postImageFileInput.value.value = '';
                postDocumentFileInput.value.value = '';
                postVideoFileInput.value.value = '';
                postAudioFileInput.value.value = '';
            }

            onMounted(async function() {
                await postEditorStore.fetchDraftPost();

                if(postEditorStore.initialPostType) {
                    switch(postEditorStore.initialPostType) {
                        case PostType.TEXT:
                            postTextInputField.value.focus();
                            break;
                        case PostType.IMAGE:
                            selectImage();
                        case PostType.DOCUMENT:
                            selectDocument();
                            break;
                        case PostType.VIDEO:
                            selectVideo();
                            break;
                        case PostType.AUDIO:
                            selectAudio();
                            break;
                        case PostType.POLL:
                            createPoll();
                            break;
                        case PostType.GIF:
                            toggleGifsPicker('open');
                            break;
                        case PostType.RECORDING:
                            toggleAudioRecorder('open');
                            break;
                    }
                }
            });

            const uploadPostMedia = (mediaFile, type = 'image') => {
                const formData = new FormData();
                formData.append(type, mediaFile);

                colibriAPI().postEditor().with(formData).withHeaders({
                    'Content-Type': 'multipart/form-data'
                }).uploadProgress((progressEvent) => {                    
                    state.postMediaUploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                }).sendTo(`media/${type}/upload`).then((response) => {

                    postEditorStore.fetchDraftPost();

                    state.postMediaUploadProgress = 0;

                    resetFileInputTags();

                }).catch((error) => {
                    toastNotifier.notifyShort(error.response.data.message);

                    state.postMediaUploadProgress = 0;

                    resetFileInputTags();
                });
            }

            const getFormSubmitData = () => {
                let formData = {
                    content: postData.value.content,
                    marks: {
                        is_sensitive: postEditorStore.isSensitive,
                        is_ai_generated: postEditorStore.isAiGenerated
                    }
                };

                if(PostTypeUtils.isPoll(postData.value.type)) {
                    formData['poll_options'] = postData.value.relations.poll.choices;
                }

                if(postEditorStore.quotedPost) {
                    formData['quoted_post_id'] = postEditorStore.quotedPost.id;
                }

                return formData;
            }

            const submitForm = async () => {
                state.postSubmitting = true;
                
                await colibriAPI().postEditor().with(getFormSubmitData()).sendTo('create').then((response) => {
                    timelineStore.prependPost(response.data.data);
                    
                    autoResize(postTextInputField.value);

                    postEditorStore.finishEditing();

                    colibriEventBus.emit('post-editor:close');
                }).catch((error) => {
                    toastNotifier.notifyShort(error.response.data.message);

                    if(PostTypeUtils.isPoll(postData.value.type)) {
                        postEditorStore.validatePollOptions(error.response.data.errors);
                    }
                });

                state.postSubmitting = false;
            }

            const selectDocument = () => {
                postDocumentFileInput.value.click();
            }

            const selectImage = () => {
                postImageFileInput.value.click();
            }

            const selectAudio = () => {
                postAudioFileInput.value.click();
            }

            const selectVideo = () => {
                postVideoFileInput.value.click();
            }

            const createPoll = () => {
                colibriAPI().postEditor().sendTo('poll/create').then((response) => {
                    postEditorStore.fetchDraftPost();
                });
            };

            const toggleGifsPicker = (action = 'toggle') => {
                if (action === 'open') {
                    state.openGifsPicker = true;
                }

                else if (action === 'close') {
                    state.openGifsPicker = false;
                }

                else if (action === 'toggle') {
                    state.openGifsPicker = ! state.openGifsPicker;
                }
            };

            const toggleAudioRecorder = (action = 'toggle') => {
                if (action === 'open') {
                    state.openAudioRecorder = true;
                }

                else if (action === 'close') {
                    state.openAudioRecorder = false;
                }

                else if (action === 'toggle') {
                    state.openAudioRecorder = ! state.openAudioRecorder;
                }
            };

            const toggleEmojisPicker = (action = 'toggle') => {
                if (action === 'open') {
                    state.openEmojisPicker = true;
                }

                else if (action === 'close') {
                    state.openEmojisPicker = false;
                }

                else if (action === 'toggle') {
                    state.openEmojisPicker = ! state.openEmojisPicker;
                }
            };

            const selectGif = (gifItem) => {
                colibriAPI().postEditor().with({
                    id: gifItem.id
                }).sendTo('gif/create').then((response) => {
                    postEditorStore.fetchDraftPost();
                }).catch((error) => {
                    toastNotifier.notifyShort(error.response.data.message);
                });

                toggleGifsPicker('close');
            };

            return {
                state: state,
                userData: userData,
                postData: postData,
                textInputHandler: textInputHandler,
                postTextInputField: postTextInputField,
                PostTypeUtils: PostTypeUtils,
                PostType: PostType,
                openCheatSheetPanel: openCheatSheetPanel,
                onImageSelect: (event) => {
                    uploadPostMedia(event.target.files[0], 'image');
                },
                onAudioSelect: (event) => {
                    uploadPostMedia(event.target.files[0], 'audio');
                },
                onVideoSelect: (event) => {
                    uploadPostMedia(event.target.files[0], 'video');
                },
                onDocumentSelect: (event) => {
                    uploadPostMedia(event.target.files[0], 'document');
                },
                onAudioRecorded: (audioFile) => {
                    toggleAudioRecorder('close');

                    uploadPostMedia(audioFile, 'audio');
                },
                onMediaPaste: (event) => {
                    imagePasteHandler(event, (imageFile) => {
                        uploadPostMedia(imageFile, 'image');
                    });
                },
                submitForm: submitForm,
                deletePostMedia: (mediaItem) => {
                    mediaItem.deleted = true;

                    colibriAPI().postEditor().with({
                        id: mediaItem.id
                    }).delete('media/delete').then((response) => {
                        postEditorStore.fetchDraftPost();
                    });
                },
                deletePostLinkSnapshot: () => {
                    ignoredLinkSnapshots.value.push(postData.value.relations.link_snapshot.url);

                    colibriAPI().postEditor().delete('link/delete').then(() => {
                        postEditorStore.deleteLinkSnapshot();
                        state.isLinkPreviewing = false;
                    });
                },
                deletePostPoll: () => {
                    colibriAPI().userTimeline().delete('post/poll/delete').then(() => {
                        postEditorStore.fetchDraftPost();
                    });
                },
                deletePostGif: () => {
                    postEditorStore.resetDraftPost();
                },
                postHasMedia: computed(() => {
                    return postData.value.relations?.media?.length;
                }),
                postHasPoll: computed(() => {
                    return postData.value.relations?.poll;
                }),
                postHasLinkSnapshot: computed(() => {
                    if(postData.value.relations?.link_snapshot) {
                        return true;
                    }

                    return false;
                }),
                postHasQuotedPost: computed(() => {
                    return postEditorStore.quotedPost !== null;
                }),
                postMedia: computed(() => {
                    return postData.value.relations.media;
                }),
                quotedPost: computed(() => {
                    return postEditorStore.quotedPost;
                }),
                postLinkSnapshot: computed(() => {
                    return postData.value.relations.link_snapshot;
                }),
                selectGif: selectGif,
                toggleGifsPicker: toggleGifsPicker,
                toggleAudioRecorder: toggleAudioRecorder,
                toggleEmojisPicker: toggleEmojisPicker,
                createPoll: createPoll,
                selectImage: selectImage,
                selectVideo: selectVideo,
                selectAudio: selectAudio,
                selectDocument: selectDocument,
                postImageFileInput: postImageFileInput,
                postVideoFileInput: postVideoFileInput,
                postDocumentFileInput: postDocumentFileInput,
                postAudioFileInput: postAudioFileInput,
                postTextInputPlaceholder: computed(() => {
                    if(PostTypeUtils.isPoll(postData.value.type)) {
                        return t('editor.post_poll_input_placeholder');
                    }
                    else{
                        return t('editor.post_text_input_placeholder');
                    }
                }),
                postMediaButtonStatus: (postType = null) => {
                    if (state.postSubmitting) {
                        return true;
                    }
                    else if(state.openAudioRecorder && PostTypeUtils.isRecording(postType)) {
                        return false;
                    }
                    else if(state.openAudioRecorder) {
                        return true;
                    }
                    else{
                        if(PostTypeUtils.isText(postData.value.type)) {
                            return false;
                        }
                        else{
                            if (PostTypeUtils.isImage(postData.value.type) && PostTypeUtils.isImage(postType)) {
                                return false;
                            }

                            return !!postData.value.type;
                        }
                    }
                },
                insertPostEmoji: (emojiSymbol) => {
                    postData.value.content = insertSymbolAtCaret(postTextInputField.value, emojiSymbol);
                    postTextInputField.value.focus();
                },
                toggleMainDropdown: () => {
                    state.isDropdownOpen = !state.isDropdownOpen;
                },
                handleFileDrop: (event) => {
                    state.isDragging = false;

					const droppedFile = event.dataTransfer.files[0];

					if (droppedFile) {
						if (droppedFile.type.startsWith('image')) {
                            uploadPostMedia(droppedFile, 'image');
                        }
                        else if(droppedFile.type.startsWith('video')) {
                            uploadPostMedia(droppedFile, 'video');
                        }
					}
                },
                markPostAsSensitive: postEditorStore.markPostAsSensitive,
                markPostAsAiGenerated: postEditorStore.markPostAsAiGenerated,
                isSensitivePost: computed(() => {
                    return postEditorStore.isSensitive;
                }),
                isAiGeneratedPost: computed(() => {
                    return postEditorStore.isAiGenerated;
                }),
                selectMention: (username) => {
					let mentionMatch = matchMention(postTextInputField.value);

					if(mentionMatch) {
						postData.value.content = completeText(postTextInputField.value, {
							completable: `@${username}`,
							start: mentionMatch.start,
							end: mentionMatch.end
						});

						postTextInputField.value.focus();
					}
                }
            };
        },
        components: {
            PrimaryTextButton: PrimaryTextButton,
            MediaCreateButton: MediaCreateButton,
            DropdownButton: DropdownButton,
            DropdownMenu: DropdownMenu,
            DropdownMenuItem: DropdownMenuItem,
            MentionsPicker: MentionsPicker,
            MediaDeleteButton: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/buttons/MediaDeleteButton.vue');
            }),
            MediaBlurOverlay: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/animations/MediaBlurOverlay.vue');
            }),
            PostPollForm: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/poll/PostPollForm.vue');
            }),
            PostGifForm: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/gif/PostGifForm.vue');
            }),
            PostRecordingForm: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/recording/PostRecordingForm.vue');
            }),
            PostGifPreview: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/preview/gif/PostGifPreview.vue');
            }),
            PostDocumentPreview: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/preview/document/PostDocumentPreview.vue');
            }),
            PostVideoPreview: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/preview/video/PostVideoPreview.vue');
            }),
            SensitivePostTape: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/assets/SensitivePostTape.vue');
            }),
            MediaFileDropper: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/parts/MediaFileDropper.vue');
            }),
            EmojisPicker: defineAsyncComponent(() => {
                return import('@D/components/emojis/EmojisPicker.vue');
            }),
            PublicationQuote: defineAsyncComponent(() => {
                return import('@D/components/timeline/feed/parts/quote/PublicationQuote.vue');
            }),
            PostLinkSnapshotPreview: defineAsyncComponent(() => {
                return import('@D/components/timeline/editor/preview/link/PostLinkSnapshotPreview.vue');
            })
        }
    });
</script>