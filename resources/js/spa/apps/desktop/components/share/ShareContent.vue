<template>
	<div class="block">
		<div class="block">
			<ShareMediaItem v-for="mediaItem in mediaOptions" v-bind:mediaItem="mediaItem" v-bind:link="link"></ShareMediaItem>
		</div>
		<div class="flex justify-center py-2.5">
			<MarginalTextButton v-on:click="copyLink" v-bind:buttonText="$t('labels.copy_link')"></MarginalTextButton>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import { useI18n } from 'vue-i18n';
	import { ToastNotifier } from '@D/core/services/toast-notification/index.js';

	import PopupPanel from '@D/components/inter-ui/popups/PopupPanel.vue';
	import PanelHeader from '@D/components/inter-ui/popups/parts/PanelHeader.vue';
	import ShareMediaItem from '@D/components/share/ShareMediaItem.vue';
	import MarginalTextButton from '@D/components/inter-ui/buttons/MarginalTextButton.vue';

	export default defineComponent({
		props: {
			mediaOptions: {
				type: Array,
				required: true
			},
			link: {
				type: String,
				required: true
			}
		},
		setup: function(props, context) {
			const { t } = useI18n();
			const toastNotifier = new ToastNotifier();

			return {
				copyLink: () => {
					navigator.clipboard.writeText(props.link).then(() => {
                        toastNotifier.notifyShort(t('toast.share_copied'), 1000);
                    });
				}
			};
		},
		components: {
			ShareMediaItem: ShareMediaItem,
			MarginalTextButton: MarginalTextButton
		}
	});
</script>