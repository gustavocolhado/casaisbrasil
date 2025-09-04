<template>
    <div class="block cursor-pointer">
        <div class="block rounded-xl border overflow-hidden border-bord-pr mb-3">
            <div class="relative">
                <div class="from-black/10 to-transparent bg-gradient-to-b absolute top-0 left-0 right-0 h-16"></div>
                <div class="inline-block opacity-80 hover:opacity-100 size-8 absolute top-2 right-2" v-bind:title="hasBookmarked ? $t('button.bookmarked') : $t('button.bookmark')">
                    <PrimaryIconButton 
                        iconName="bookmark"
                        hoverText="hover:text-white"
                        buttonColor="text-white"
                        v-on:click.prevent.stop="bookmarkProduct"
                    v-bind:iconType="(hasBookmarked ? 'solid' : 'line')"></PrimaryIconButton>
                </div>
                <img v-bind:src="productData.preview_image_url" alt="Image" class="w-full">
            </div>
        </div>
        <div class="flex-1 flex flex-col">
            <div class="tracking-tighter leading-none mb-2">
                <span class="text-lab-pr2 text-par-l font-semibold">{{ price }}</span>
                <span v-if="productData.sale_price" class="text-lab-sc text-par-s ml-1.5 line-through">{{ productData.price.formatted }}</span>
                <span v-if="productData.reviews_count.raw" class="text-lab-sc text-par-s ml-2">{{ $t('labels.reviews_number', { n: productData.reviews_count.formatted }, productData.reviews_count.raw) }}</span>
            </div>
            
            <div class="block mb-2">
                <h4 class="capitalize smoothing hover:text-brand-900 text-par-s text-lab-pr2 line-clamp-2 font-normal leading-tight">
                    {{ productData.title }}
                </h4>
            </div>
            <div class="text-cap-s text-lab-sc overflow-hidden">
                <RouterLink v-bind:to="merchantRoute" class="truncate hover:underline">
                    {{ merchant.name }}
                </RouterLink>, {{ productData.category_name }}
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent, reactive, ref, computed } from 'vue';
    import { useMarketStore } from '@D/store/market/market.store.js';
    import { useI18n } from 'vue-i18n';
    import { ToastNotifier } from '@D/core/services/toast-notification/index.js';
    
    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';

    export default defineComponent({
        props: {
            productData: {
                type: Object,
                default: {}
            }
        },
        setup: function(props) {
            const state = reactive({
                isSubmitting: false
            });

            const { t } = useI18n();
            const toastNotifier = new ToastNotifier();
            const productData = ref(props.productData);
            const marketStore = useMarketStore();

            return {
                state: state,
                productData: productData,
                bookmarkProduct: async function() {
                    state.isSubmitting = true;

                    await marketStore.bookmarkProduct(productData.value.id).then((response) => {
                        if(response.data.data.bookmarked) {
                            productData.value.meta.activity.bookmarked = true;
                            marketStore.incrementBookmarksCount();
                            toastNotifier.notifyShort(t('toast.product.product_bookmarked'));
                        }
                        else{
                            productData.value.meta.activity.bookmarked = false;
                            marketStore.decrementBookmarksCount();
                            toastNotifier.notifyShort(t('toast.product.product_unbookmarked'));
                        }
                    }).catch((error) => {
                        if(error.response) {
                            alert(error.response.data.message);
                        }
                    });

                    state.isSubmitting = false;
                },
                merchantRoute: computed(() => {
                    let isStore = productData.value.relations.merchant.is_store;

                    return {
                        name: (isStore ? 'market_store_page' : 'profile_page'),
                        params: {
                            id: productData.value.relations.merchant.username
                        }
                    };
                }),
                merchant: computed(() => {
                    return productData.value.relations.merchant;
                }),
                price: computed(() => {
                    if(productData.value.sale_price) {
                        return productData.value.sale_price.formatted;
                    }

                    return productData.value.price.formatted;
                }),
                hasBookmarked: computed(() => {
                    return productData.value.meta.activity.bookmarked;
                })
            }
        },
        components: {
            PrimaryIconButton: PrimaryIconButton
        }
    });
</script>