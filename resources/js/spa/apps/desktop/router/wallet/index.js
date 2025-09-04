import WalletPage from '@D/views/wallet/WalletPage.vue';
import { Layouts } from '@D/core/constants/layouts.js';

export default {
    path: '/wallet',
    component: WalletPage,
    alias: '/wallet',
    meta: {
        layout: Layouts.MAIN,
        auth: true,
        feature: 'wallet'
    },
    name: 'wallet_page',
    redirect: { name: 'wallet_index_page' },
    children: [
        {
            path: 'index',
            component: function() {
                return import('@D/views/wallet/children/index/WalletIndexPage.vue');
            },
            name: 'wallet_index_page'
        },
    ]
}