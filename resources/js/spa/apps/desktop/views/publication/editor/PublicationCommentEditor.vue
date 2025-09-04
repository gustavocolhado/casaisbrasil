<template>
	<div class="block px-3">
		<form v-on:submit.prevent="submitComment">
			<div class="py-4" v-if="repliedComment">
				<div class="flex overflow-hidden">
					<div class="size-small-avatar shrink-0">
						<div class="transform -scale-x-100 size-small-avatar bg-brand-900 inline-flex-center overflow-hidden rounded-full">
							<SvgIcon name="share-06" type="line" classes="size-icon-small text-white"></SvgIcon>
						</div>
					</div>
					<div class="flex-1 overflow-hidden mx-4">
						<div class="overflow-hidden">
							<h3 class="text-par-n font-semibold text-lab-pr2 leading-none mb-1">
								{{ repliedComment.relations.user.name }}

								<span class="text-par-s text-lab-sc leading-none ml-1 font-normal">
									{{ repliedComment.date.time_ago }}
								</span>
							</h3>
							<p class="text-par-s truncate text-lab-pr2">
								{{ repliedComment.content }}
							</p>
						</div>
					</div>
					<div class="size-small-avatar shrink-0">
						<PrimaryIconButton v-on:click="cancelCommentReply" name="x-close"></PrimaryIconButton>
					</div>
				</div>
			</div>
			<div class="flex pb-2 items-end relative border-b inactive-input-line" v-bind:class="[state.commentInputFocused ? 'active-input-line border-brand-900' : 'border-lab-pr3']">
				<div class="flex max-w-content flex-1">
					<div class="shrink-0 self-end">
						<AvatarSmall v-bind:avatarSrc="userData.avatar_url"></AvatarSmall>
					</div>
					<div class="flex-1 ml-4 leading-none">
						<div class="block max-h-72 overflow-y-auto">
							<textarea
								ref="commentTextInputField"
								v-model.trim="commentInputText"
								v-on:focus="commentFocusHandler"
								v-on:blur="commentBlurHandler"
							v-on:input="commentInputHandler"
							v-bind:placeholder="$t('labels.enter_comment_placeholder') + '...'"
							class="bg-transparent outline-hidden w-full h-small-avatar min-h-small-avatar resize-none text-lab-pr text-par-n leading-tight pt-2 placeholder:text-par-n"></textarea>
						</div>
					</div>
				</div>
				<div class="ml-auto shrink-0">
					<div class="inline-flex items-center gap-4">
						<div class="relative">
							<button type="button" v-on:click.stop="state.isEmojisPickerOpen = true" class="inline-block size-icon-normal outline-hidden cursor-pointer">
								<SvgIcon type="line" name="face-smile" classes="size-full text-brand-900"></SvgIcon>
							</button>
							<template v-if="state.isEmojisPickerOpen">
								<div class="block absolute bottom-6 right-0 w-80 z-50">
									<EmojisPicker 
										v-on:pickemoji="insertCommentEmoji"
									v-on:close="state.isEmojisPickerOpen = false"></EmojisPicker>
								</div>
							</template>
						</div>
						<PrimaryPillButton v-bind:loading="state.isSubmitting" v-bind:disabled="state.isSubmitting || state.isLoading" buttonType="submit" buttonSize="lm" v-bind:buttonText="$t('labels.leave_comment_button')"></PrimaryPillButton>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
	import { defineComponent, ref, defineAsyncComponent, reactive, onMounted } from 'vue';
	import { colibriAPI } from '@/kernel/services/api-client/native/index.js';

	import PrimaryPillButton from '@D/components/inter-ui/buttons/PrimaryPillButton.vue';
	import AvatarSmall from '@D/components/general/avatars/AvatarSmall.vue';
	import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';
	import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { useInputHandlers } from '@D/core/composables/input/index.js';
	import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';
	
	export default defineComponent({
		props: {
			postId: {
				type: Number,
				default: 0
			}
		},
		emits: ['commentadded'],
		setup: function(props, context) {
			const commentInputText = ref('');
			const toastNotifier = new ToastNotifier();
			const authStore = useAuthStore();
            const userData = ref(authStore.userData);
			const postId = ref(props.postId);
			const repliedComment = ref(null);

			const state = reactive({
                isSubmitting: false,
                isEmojisPickerOpen: false,
                commentInputFocused: false
            });

			const { autoResize, insertSymbolAtCaret } = useInputHandlers();
			const commentTextInputField = ref(null);

            const commentInputHandler = function() {
                autoResize(commentTextInputField.value);
            }

			onMounted(() => {
				colibriEventBus.on('publication-comment:reply', (event) => {
					repliedComment.value = event.commentData;
				});
			});

			return {
				state: state,
				userData: userData,
				commentInputText: commentInputText,
				repliedComment: repliedComment,
				commentInputHandler: commentInputHandler,
				commentTextInputField: commentTextInputField,
				insertCommentEmoji: (emojiSymbol) => {
                    commentInputText.value = insertSymbolAtCaret(commentTextInputField.value, emojiSymbol);
                    commentTextInputField.value.focus();
                },
				submitComment: async () => {
                    if(commentInputText.value.length > 0) {
                        
                        state.isSubmitting = true;
                        let parentId = null;

                        if(repliedComment.value) {
                            parentId = repliedComment.value.id;
                        }

                        await colibriAPI().userTimeline().with({
                            post_id: postId.value,
                            content: commentInputText.value,
                            parent_id: parentId
                        }).sendTo('post/comment/create').then((response) => {
                            context.emit('commentadded', response.data.data);
                            commentInputText.value = '';

                            autoResize(commentTextInputField.value);

                            repliedComment.value = null;
                        }).catch((error) => {
                            if (error.response) {
                                toastNotifier.notifyShort(error.response.data.message);
                            }
                        });

                        state.isSubmitting = false;
                    }
                },
				commentFocusHandler: () => {
                    state.commentInputFocused = true;
                },
                commentBlurHandler: () => {
                    state.commentInputFocused = false;
                },
				cancelCommentReply: () => {
                    repliedComment.value = null;
                }
			};
		},
		components: {
			PrimaryPillButton: PrimaryPillButton,
			AvatarSmall: AvatarSmall,
			PrimaryIconButton: PrimaryIconButton,
			EmojisPicker: defineAsyncComponent(() => {
                return import('@D/components/emojis/EmojisPicker.vue');
            })
		}
	});
</script>