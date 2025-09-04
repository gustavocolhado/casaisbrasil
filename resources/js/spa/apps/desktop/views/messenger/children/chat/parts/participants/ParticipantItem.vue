<template>
	<RouterLink v-bind:to="{ name: 'profile_page', params: { id: participantData.relations.user.username }}" target="_blank" class="block">
		<div class="flex items-center gap-2 hover:bg-fill-qt py-2 px-4 cursor-pointer leading-none">
			<div class="shrink-0">
				<AvatarSmall v-bind:avatarSrc="participantData.relations.user.avatar_url"></AvatarSmall>
			</div>
			<div class="flex-1 overflow-hidden truncate text-lab-sc">
				<span class="text-par-s text-lab-pr2 font-medium">
					{{ participantData.relations.user.name }}
					<VerificationBadge v-if="participantData.relations.user.verified" size="xs"></VerificationBadge>
				</span>
			</div>
			<div class="shrink-0">
				<span class="text-cap-l text-lab-sc font-medium truncate block">
					{{ participantData.relations.user.last_active.time_ago }}
				</span>
			</div>
		</div>
	</RouterLink>
</template>

<script>
	import { defineComponent } from 'vue';
	import AvatarSmall from '@D/components/general/avatars/AvatarSmall.vue';

	export default defineComponent({
		props: {
			participantData: {
				type: Object,
				required: true
			} 
		},
		setup: function (props, context) {
			return {
				
			};
		},
		components: {
			AvatarSmall: AvatarSmall
		}
	});
</script>