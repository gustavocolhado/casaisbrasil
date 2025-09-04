<template>
	<div class="py-4">
		<div class="px-4 mb-4">
			<div class="block mb-2">
				<RouterLink v-bind:to="{ name: 'home_page' }">
					<img class="h-7" v-bind:src="$embedder('assets.logos.url')" alt="Logo">
				</RouterLink>
			</div>
			<h2 class="text-2xl font-bold mb-1 text-lab-pr2">
				ColibriPlus Mobile
			</h2>
			<p class="text-lab-sc text-sm mb-2">
				Mobile version of ColibriPlus is under development.
			</p>

			<p class="text-lab-sc text-sm mb-2">
				Join our <a href="https://t.me/colibriplus" target="_blank" class="text-brand-900 hover:underline">Telegram channel</a> to stay updated.
			</p>

			<p class="text-lab-sc text-xs">
				Developed with ❤️ by <a href="https://terla.me" target="_blank" class="underline">Mansur Terla</a>
			</p>
		</div>
		<div class="border-t border-gray-200">
			<TimelinePublicationSkeleton v-for="i in 10" :key="i"></TimelinePublicationSkeleton>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import TimelinePublicationSkeleton from '@M/components/timeline/feed/TimelinePublicationSkeleton.vue';

	export default defineComponent({
		setup: function() {
			return {};
		},
		components: {
			TimelinePublicationSkeleton: TimelinePublicationSkeleton
		}
	});
</script>