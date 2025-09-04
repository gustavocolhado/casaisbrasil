<template>
	<div class="block">
		<FilterBlock v-bind:title="$t('market.filter.price')">
			<div class="flex gap-2">
				<div class="w-6/12">
					<label class="text-par-s text-lab-pr">
						{{ $t('market.filter.price_from') }}
					</label>
					<input v-model.trim="filter.price.from" type="number" step="any" min="0" class="block px-3 bg-transparent border border-edge-sc h-9 rounded-md w-full outline-hidden text-lab-pr placeholder:text-lab-sc placeholder:text-par-s text-par-s"/>
				</div>
				<div class="w-6/12">
					<label class="text-par-s text-lab-pr">
						{{ $t('market.filter.price_to') }}
					</label>
					<input v-model.trim="filter.price.to" type="number" step="any" min="0" class="block px-3 bg-transparent border border-edge-sc h-9 rounded-md w-full outline-hidden text-lab-pr placeholder:text-lab-sc placeholder:text-par-s text-par-s"/>
				</div>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.store')" v-bind:caption="$t('market.filter.store_caption')">
			<div class="block">
				<SecondarySwitcher v-model="filter.is_store" v-bind:label="$t('market.filter.store_label')"></SecondarySwitcher>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.discount')" v-bind:caption="$t('market.filter.discount_caption')">
			<div class="block">
				<SecondarySwitcher v-model="filter.with_discount" v-bind:label="$t('market.filter.discount_label')"></SecondarySwitcher>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.rating')" v-bind:caption="$t('market.filter.rating_caption')">
			<div class="block">
				<SecondarySwitcher v-model="filter.high_rating" v-bind:label="$t('market.filter.rating_label')"></SecondarySwitcher>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.condition')">
			<div class="block max-h-72 overflow-y-auto">
				<div v-for="(item, idx) in metadata.filter.conditions" v-bind:key="idx" class="block hover:bg-fill-qt p-1">
					<Checkbox v-model="filter.conditions[item.key]" v-bind:name="item.key" v-bind:label="item.value"></Checkbox>
				</div>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.currency')">
			<div class="block max-h-72 overflow-y-auto">
				<div v-for="(item, idx) in metadata.filter.currencies" v-bind:key="idx" class="block hover:bg-fill-qt p-1">
					<Checkbox v-model="filter.currencies[item.key]" v-bind:name="item.key" v-bind:label="item.value"></Checkbox>
				</div>
			</div>
		</FilterBlock>
		<FilterBlock v-bind:title="$t('market.filter.type')">
			<div class="block max-h-72 overflow-y-auto">
				<div v-for="(item, idx) in metadata.filter.types" v-bind:key="idx" class="block hover:bg-fill-qt p-1">
					<Checkbox v-model="filter.types[item.key]" v-bind:name="item.key" v-bind:label="item.value"></Checkbox>
				</div>
			</div>
		</FilterBlock>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';
	import TextInput from '@D/components/forms/TextInput.vue';
	import SecondarySwitcher from '@D/components/inter-ui/switchers/SecondarySwitcher.vue';
	import Checkbox from '@D/components/inter-ui/checkbox/Checkbox.vue';
	import FilterBlock from '@D/components/forms/filter/FilterBlock.vue';
	import { useMarketStore } from '@D/store/market/market.store.js';

	export default defineComponent({
		setup(props, context) {
			const marketStore = useMarketStore();

			const metadata = computed(() => {
                return marketStore.metadata;
            });

			return {
				metadata: metadata,
				filter: marketStore.filter
			};
		},
		components: {
			TextInput: TextInput,
			SecondarySwitcher: SecondarySwitcher,
			Checkbox: Checkbox,
			FilterBlock: FilterBlock
		}
	});
</script>