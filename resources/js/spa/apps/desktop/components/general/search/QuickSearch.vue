<template>
	<div class="block bg-fill-tr overflow-hidden rounded-full relative">
		<div class="z-10 absolute left-4 top-0 bottom-0 inline-flex-center">
			<span class="size-icon-small text-lab-tr">
				<SvgIcon name="search-lg"></SvgIcon>
			</span>
		</div>
		<input
			v-on:input="updateModelValue"
			v-bind:value="modelValue"
			class="block w-full bg-transparent outline-hidden text-par-s text-lab-pr px-10 h-10"
			v-bind:placeholder="placeholder"
		type="text">

		<button v-if="modelValue.length" v-on:click="cancelSearch" type="button" class="inline-flex outline-hidden bg-fill-pr text-lab-tr rounded-full size-x-small-avatar absolute top-2 right-2">
			<SvgIcon name="x"></SvgIcon>
		</button>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';

	export default defineComponent({
		props: {
			modelValue: {
                type: String,
                default: ''
            },
			placeholder: {
                type: String,
                default: ''
            },
		},
		emits: ['cancelsearch', 'update:modelValue'],
		setup(props, context) {
			return {
				modelValue: computed(() => {
                    return props.modelValue;
                }),
				updateModelValue: (event) => {
                    context.emit('update:modelValue', event.target.value);
                },
				cancelSearch: () => {
					context.emit('cancelsearch');
				}
			};
		}
	});
</script>