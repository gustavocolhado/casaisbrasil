<template>
	<div class="block border-b border-bord-pr px-3 py-3 last:border-none">
		<div class="flex items-center justify-between cursor-pointer mb-2">
			<AvatarRightSided 
				v-bind:avatarSrc="userData.avatar_url"
				v-bind:name="userData.name"
				v-bind:verified="userData.verified"
				v-bind:linkRoute="{ name: 'profile_page', params: { id: userData.username } }"
			v-bind:caption="userData.caption"></AvatarRightSided>
			<div class="shrink-0">
				<FollowPillButton v-bind:followableId="userData.id" v-bind:relationship="userData.meta.relationship.follow"></FollowPillButton>
			</div>
		</div>
		<div class="pl-small-avatar">
			<div class="pl-2">
				<p v-if="userData.bio.length" class="text-par-s text-lab-pr2 content-text line-clamp-2" v-html="mdInlineRenderer(userData.bio)"></p>
				<div v-if="userData.website" class="mt-2">
					<a v-bind:href="userData.website" class="inline-block text-par-s text-brand-900 content-text hover:underline leading-tight" target="_blank">
						{{ userData.website }}
					</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import { mdInlineRenderer } from '@/kernel/helpers/md/index.js';

	import AvatarRightSided from '@D/components/general/avatars/sided/small/AvatarRightSided.vue';
	import FollowPillButton from '@D/components/inter-ui/buttons/follows/FollowPillButton.vue';
	
	export default defineComponent({
		props: {
			userData: {
				type: Object,
				required: true
			}
		},
		setup: function() {
			return {
				mdInlineRenderer: mdInlineRenderer
			};
		},
		components: {
			AvatarRightSided: AvatarRightSided,
			FollowPillButton: FollowPillButton
		}
	});
</script>