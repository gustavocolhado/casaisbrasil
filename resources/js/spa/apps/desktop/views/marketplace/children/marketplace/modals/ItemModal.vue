<template>
	<PrimaryTransition>
		<div v-bind:class="[state.isChatLauncherOpen ? 'invisible' : '']">
			<ContentModal v-if="productData">
				<ModalHeader v-bind:modalTitle="$t('market.product_title')" v-on:close="closeModal"></ModalHeader>
				<ProductOverviewCard
					v-on:ask="messageBoxToggle"
				v-bind:productData="productData"></ProductOverviewCard>
				<Border height="h-3" opacity="opacity-60"></Border>
				<ProductDescriptionCard v-bind:productData="productData"></ProductDescriptionCard>
			</ContentModal>
		</div>
	</PrimaryTransition>

	<Teleport v-if="productData && state.isChatLauncherOpen" to="body">
		<PrimaryTransition>
			<ChatLauncher
				v-bind:userId="productData.relations.merchant.id"
				v-bind:payload="chatLauncherPayload"
			v-on:close="messageBoxToggle"></ChatLauncher>
		</PrimaryTransition>
	</Teleport>
</template>

<script>
	import { defineComponent, computed, reactive, defineAsyncComponent } from 'vue';
	import { useMarketStore } from '@D/store/market/market.store.js';

	import ContentModal from '@D/components/general/modals/ContentModal.vue';
	import ModalHeader from '@D/components/general/modals/parts/ModalHeader.vue';
	import ProductOverviewCard from '@D/views/marketplace/children/marketplace/modals/parts/ProductOverviewCard.vue';
    import ProductDescriptionCard from '@D/views/marketplace/children/marketplace/modals/parts/ProductDescriptionCard.vue';

	export default defineComponent({
		setup: function() {
			const marketStore = useMarketStore();

			const state = reactive({
                isChatLauncherOpen: false
            });

			const productData = computed(() => {
				return marketStore.product;
			});

			const closeModal = () => {
				marketStore.product = null;
			};

			return {
				state: state,
				productData: productData,
				closeModal: closeModal,
				messageBoxToggle: function() {
                    state.isChatLauncherOpen = !state.isChatLauncherOpen;
                },
                chatLauncherPayload: computed(() => {
                    return {
                        type: 'product',
                        id: productData.value.id
                    }
                })
			};
		},
		components: {
			ContentModal: ContentModal,
			ModalHeader: ModalHeader,
			ProductOverviewCard: ProductOverviewCard,
			ProductDescriptionCard: ProductDescriptionCard,
			ChatLauncher: defineAsyncComponent(function() {
                return import('@D/components/inter-ui/chat/ChatLauncher.vue');
            })
		}
	});
</script>