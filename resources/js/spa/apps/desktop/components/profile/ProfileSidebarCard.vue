<template>
	<div class="p-4 border border-bord-pr rounded-2xl">
		<div class="mb-2">
			<AvatarMedium v-bind:avatarSrc="profileData.avatar_url"></AvatarMedium>
		</div>
		<div class="block">
			<h4 class="text-title-3 font-bold text-lab-pr2 tracking-tighter leading-none">
				{{ profileData.name }}

				<span class="size-icon-x-small inline-block text-brand-900">
					<SvgIcon name="check-verified-02"></SvgIcon>
				</span>
			</h4>
			<RouterLink v-bind:to="{ name: 'profile_page', params: { id: profileData.username }}" class="block mb-1 text-par-s text-lab-sc hover:underline">
				@{{ profileData.username }}
			</RouterLink>
			<span class="block text-par-s text-lab-sc">
				<span class="font-mono">{{ profileData.followers_count.formatted }}</span> {{ $t('labels.followers_count', profileData.followers_count.raw) }}
			</span>
			<span v-if="profileData.meta.relationship.follow.followed_by" class="block text-par-s text-lab-sc mt-1">
				{{ $t('labels.following_you_on', { app_name: $embedder('config.app.name') }) }}
			</span>
			<p v-if="profileData.description.length" v-html="mdInlineRenderer(profileData.description)" class="text-par-s text-lab-pr2 mt-2 mb-4"></p>
			<div class="mt-2 text-cap-l text-lab-sc">
				{{ $t('labels.was_online_at', { time: profileData.last_active.formatted }) }}
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import { mdInlineRenderer } from '@/kernel/helpers/md/index.js';

	import AvatarMedium from '@D/components/general/avatars/AvatarMedium.vue';

	export default defineComponent({
		props: {
			profileData: {
				type: Object,
				required: true
			}
		},
		setup: function(props, context) {
			return {
				mdInlineRenderer: mdInlineRenderer
			};
		},
		components: {
			AvatarMedium: AvatarMedium
		}
	});
</script>