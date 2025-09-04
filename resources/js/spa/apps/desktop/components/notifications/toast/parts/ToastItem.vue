<template>
	<div class="flex max-w-content justify-center">
		<div class="bg-bg-pr/30 backdrop-blur-md border pl-5 pr-3 rounded-xl text-bg-pr shadow-2xl" v-bind:class="[toastStyle]">
			<div class="flex items-center leading-4">
				<div class="text-par-s pr-4 text-lab-pr flex-1 py-4">
					{{ toastData.text }}
				</div>
				<div class="text-lab-sc shrink-0 pl-2 py-1.5">
					<button v-on:click="$emit('dismiss', toastData.id)" class="smoothing size-6 outline-hidden cursor-pointer leading-zero opacity-80 hover:opacity-100">
						<SvgIcon name="x" type="solid" classes="size-full"></SvgIcon>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent, computed } from 'vue';

	export default defineComponent({
		props: {
			toastData: {
				type: Object,
				required: true
			}
		},
		emits: ['dismiss'],
		setup: function(props) {
			return {
				toastStyle: computed(() => {
					if(props.toastData.type === 'success') {
						return 'border-green-900';
					}
					
					else {
						return 'border-red-900';
					}
				})
			};
		}
	});
</script>