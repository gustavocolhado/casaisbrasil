<template>
	<header class="fixed top-0 left-0 right-0 z-10 border-b border-bord-pr popup-background-pr">
		<CatalogContainer>
			<div class="flex items-center h-16">
				<RouterLink v-bind:to="{ name: 'home_page' }">
					<img class="h-7" v-bind:src="$embedder('assets.logos.url')" alt="Logo">
				</RouterLink>

				<div class="mx-auto flex items-center gap-8 h-full text-lab-sc font-medium">
					<RouterLink v-bind:to="{ name: 'home_page' }" class="cursor-pointer hover:text-lab-pr2">
						{{ $t('labels.home') }}
					</RouterLink>
					<RouterLink v-bind:to="{ name: 'bookmarks_page' }" class="cursor-pointer hover:text-lab-pr2">
						{{ $t('labels.bookmarks') }}
					</RouterLink>
				</div>
				<div class="flex justify-center cursor-pointer">
					<RouterLink v-bind:to="{ name: 'profile_page', params: { id: userData.username } }">
						<img class="size-10 rounded-full border border-bord-pr" v-bind:src="userData.avatar_url" alt="Avatar">
					</RouterLink>
				</div>
			</div>
		</CatalogContainer>
	</header>
</template>

<script>
	import { defineComponent, computed } from 'vue';
	import CatalogContainer from '@D/components/layout/CatalogContainer.vue';
	import { useAuthStore } from '@D/store/auth/auth.store.js';

	export default defineComponent({
		components: {
			CatalogContainer: CatalogContainer
		},
		setup: function () {
			const authStore = useAuthStore();

			return {
				userData: computed(() => {
					return authStore.userData;
				}),
			}
		}
	});
</script>