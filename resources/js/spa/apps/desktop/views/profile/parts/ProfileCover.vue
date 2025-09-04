<template>
	<div v-on:click="lightboxCover" class="overflow-hidden rounded-tl-2xl rounded-tr-2xl cursor-pointer min-h-[180px] bg-fill-fv">
		<img class="w-full" v-bind:src="profileData.cover_url" alt="Cover">
	</div>
</template>

<script>
    import { defineComponent, inject } from 'vue';
	import { useLightboxStore } from '@D/store/lightbox/lightbox.store.js';

    export default defineComponent({
		setup: function() {
			const profileData = inject('profileData');
			const lightboxStore = useLightboxStore();

			return {
				profileData: profileData,
				lightboxCover: function() {
					lightboxStore.add({
						albumName: `${profileData.value.name} ${profileData.value.caption}`,
						images: [profileData.value.cover_url]
					});
				}
			}
		}
    });
</script>