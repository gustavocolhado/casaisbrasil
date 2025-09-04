<template>
	<div class="flex gap-3 flex-wrap">
		<div v-if="profileData.caption" class="inline-flex gap-1 text-lab-sc leading-zero items-center">
			<span class="text-lab-tr">
				<SvgIcon name="briefcase-01" type="line" classes="size-icon-small"></SvgIcon>
			</span>
			<span class="text-par-s">
				{{ profileData.caption }}
			</span>
		</div>
		<div v-if="profileData.country" class="inline-flex gap-1 text-lab-sc leading-zero items-center">
			<span class="text-lab-tr">
				<SvgIcon name="marker-pin-01" type="line" classes="size-icon-small"></SvgIcon>
			</span>
			<span class="text-par-s">
				{{ profileData.country_name }}, <span v-if="profileData.city">{{ profileData.city }}</span>
			</span>
		</div>
		<div class="inline-flex gap-1 text-lab-sc leading-zero items-center">
			<span class="text-lab-tr">
				<SvgIcon name="calendar-check-01" type="line" classes="size-icon-small"></SvgIcon>
			</span>
			<span class="text-par-s">
				{{ $t('labels.joined_at_date', { date: profileData.join_date.formatted }) }}
			</span>
		</div>
		<div v-on:click="state.isModalOpen = true" class="inline-flex gap-1 text-lab-sc leading-zero items-center cursor-pointer">
			<span class="text-lab-tr">
				<SvgIcon name="info-circle" type="line" classes="size-icon-small"></SvgIcon>
			</span>
			<span class="text-par-s">
				{{ $t('labels.more') }}
			</span>
		</div>
	</div>
	
	<template v-if="state.isModalOpen">
		<ProfileDetailsModal v-on:close="state.isModalOpen = false"></ProfileDetailsModal>
	</template>
</template>

<script>
	import { defineComponent, reactive, onMounted, inject } from 'vue';
	import { colibriEventBus } from '@/kernel/events/bus/index.js';
	
	import ProfileDetailsModal from '@D/views/profile/parts/modals/ProfileDetailsModal.vue';

	export default defineComponent({
		setup: function() {
			const profileData = inject('profileData');
			const state = reactive({
				isModalOpen: false
			});

			onMounted(() => {
				colibriEventBus.on('profile-page:show-details', () => {
					state.isModalOpen = true;
				});
			});

			return {
				state: state,
				profileData: profileData
			}
		},
		components: {
			ProfileDetailsModal: ProfileDetailsModal
		}
	});
</script>