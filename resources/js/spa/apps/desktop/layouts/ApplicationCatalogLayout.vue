<template>
	<CatalogHeader></CatalogHeader>

	<div class="pt-24 pb-8">
		<RouterView></RouterView>
	</div>

	<ToastNotification></ToastNotification>
	<LightboxPlayer></LightboxPlayer>
</template>

<script>
	import { defineComponent } from 'vue';
	import CatalogHeader from '@D/components/layout/CatalogHeader.vue';
	import ToastNotification from '@D/components/notifications/toast/ToastNotification.vue';
	import LightboxPlayer from '@D/components/lightbox/LightboxPlayer.vue';

	export default defineComponent({
		components: {
			CatalogHeader: CatalogHeader,
			ToastNotification: ToastNotification,
			LightboxPlayer: LightboxPlayer
		}
	});
</script>