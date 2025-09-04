<template>
	<div class="block border-b p-4 border-b-bord-pr last:border-b-0 cursor-pointer hover:bg-fill-qt">
		<div class="block mb-2">
			<AvatarRightSided 
				v-bind:name="merchantData.name"
				v-bind:avatarSrc="merchantData.avatar_url"
				v-bind:linkRoute="merchantRoute"
			v-bind:caption="merchantData.caption"></AvatarRightSided>
		</div>
		<div class="ml-small-avatar pl-2">
			<div class="flex gap-3">
				<div class="flex-1 pr-4">
					<div class="block mb-1">
						<h4 class="text-par-m text-lab-pr tracking-tighter leading-tight line-clamp-2">
							{{ productData.title }}
						</h4>
					</div>
					<div class="mb-1.5">
						<div class="text-cap-s text-lab-sc overflow-hidden">
							<span class="shrink-0 truncate block">
								{{ productData.category_name }}
							</span>
						</div>
					</div>
					<div class="tracking-tighter leading-none">
						<span class="text-lab-pr2 text-par-l font-semibold">{{ price }}</span>
						<span v-if="productData.sale_price" class="text-lab-sc text-par-s ml-1.5 line-through">{{ productData.price.formatted }}</span>
						<span v-if="productData.reviews_count.raw" class="text-lab-sc text-par-s ml-2">{{ $t('labels.reviews_number', { n: productData.reviews_count.formatted }, productData.reviews_count.raw) }}</span>
					</div>
				</div>
				<div class="size-16 overflow-hidden rounded-md border border-bord-pr">
					<img v-bind:src="productData.preview_image_url" alt="Image" class="size-full object-cover">
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, computed, ref } from 'vue';
	import AvatarRightSided from '@D/components/general/avatars/sided/small/AvatarRightSided.vue';

	export default defineComponent({
		props: {
			productData: {
				type: Object,
				required: true
			}
		},
		setup: function(props) {
			const productData = ref(props.productData);

			return {
				merchantRoute: computed(() => {
					let isStore = productData.value.relations.merchant.is_store;

                    return {
                        name: (isStore ? 'market_store_page' : 'profile_page'),
                        params: {
                            id: productData.value.relations.merchant.username
                        }
                    };
				}),
				merchantData: computed(() => {
                    return productData.value.relations.merchant;
                }),
				price: computed(() => {
                    if(productData.value.sale_price) {
                        return productData.value.sale_price.formatted;
                    }

                    return productData.value.price.formatted;
                })
			};
		},
		components: {
			AvatarRightSided: AvatarRightSided
		}
	});
</script>