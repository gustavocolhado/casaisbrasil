<template>
	<div class="block">
		<div class="pl-4 pr-6 bg-input-pr rounded-full flex items-center">
			<div class="h-14 relative flex-1 mr-4">
				<span class="absolute top-0 bottom-0 flex-center h-full left-0">
					<SvgIcon type="solid" name="search-lg" classes="size-icon-normal text-lab-pr2"></SvgIcon>
				</span>
				<input 
					type="text"
					v-bind:value="modelValue"
					v-on:input.lazy.debounce.500="updateModelValue"
					class="bg-transparent h-full w-full pl-8 text-lab-pr2 text-par-m outline-hidden placeholder:text-lab-pr2 placeholder:font-light rounded-md border border-transparent"
				v-bind:placeholder="placeholder">
			</div>
			<template v-if="$slots.default">
				<div class="shrink-0 border-l border-edge-sc pl-4">
					<slot></slot>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';

	export default defineComponent({
		props: {
			placeholder: {
				type: String,
				default: ''
			},
			modelValue: {
				type: String,
				default: ''
			},
		},
		emits: ['update:modelValue'],
		setup(props, context) {
			return {
				modelValue: computed(() => {
                    return props.modelValue;
                }),
				updateModelValue: (event) => {
					context.emit('update:modelValue', event.target.value);
				}
			};
		}
	});
</script>