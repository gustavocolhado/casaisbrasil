<template>
	<div class="block">
		<div class="flex px-4 items-center justify-between py-1.5 cursor-pointer">
			<AvatarRightSided 
				v-bind:avatarSrc="userData.avatar_url"
				v-bind:verified="userData.verified"
				v-bind:name="userData.name"
				v-bind:linkRoute="{ name: 'profile_page', params: { id: userData.username } }"
			v-bind:caption="userData.caption"></AvatarRightSided>
			<div class="shrink-0">
				<FollowPillButton v-bind:followableId="userData.id" v-bind:relationship="userData.meta.relationship.follow"></FollowPillButton>
			</div>
		</div>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	
	import AvatarRightSided from '@D/components/general/avatars/sided/small/AvatarRightSided.vue';
	import FollowPillButton from '@D/components/inter-ui/buttons/follows/FollowPillButton.vue';

	export default defineComponent({
		props: {
			userData: {
				type: Object,
				required: true
			}
		},
		components: {
			FollowPillButton: FollowPillButton,
			AvatarRightSided: AvatarRightSided
		}
	});
</script>