import { colibriEventBus } from '@/kernel/events/bus/index.js';
import { colibriAPI } from '@/kernel/services/api-client/native/index.js';
import { useI18n } from 'vue-i18n';
import { ToastNotifier } from '@D/core/services/toast-notification/index.js';

function useDeletePost() {
    const { t } = useI18n();
    const toastNotifier = new ToastNotifier();

	const postDeleter = (postData, callback = null) => {
		colibriEventBus.emit('confirmation-modal:open', {
			title: t('prompt.delete_post.title'),
			description: t('prompt.delete_post.description'),
			onConfirm: () => {
				colibriAPI().userTimeline().with({
					id: postData.id
				}).delete('post/delete').then(() => {

					// Call the callback if it is provided.
					if (callback) {
						callback(postData.id);
					}
	
					toastNotifier.notifyShort(t('toast.media.post_deleted'));
				}).catch((error) => {
					if (error.response) {
						toastNotifier.notifyShort(error.response.data.message);
					}
				});
			}
		});
	}

	return {
		postDeleter: postDeleter
	}
}

export { useDeletePost };