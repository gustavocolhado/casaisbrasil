import useToastNotificationStore from '@D/store/toast/toast.store.js';

class ToastNotifier {
    toastStore = null;

    constructor() {
        this.toastStore = useToastNotificationStore();
    }

    notifyShort(message = '', duration = 5000) {
        this.toastStore.add(message, duration);
    }
};

export { ToastNotifier };