<template>
	<Teleport to="body">
		<ContentModal>
			<ModalHeader v-on:close="$emit('close')" v-bind:modalTitle="$t('labels.about_account')"></ModalHeader>
			<div v-if="state.isLoading" class="flex justify-center py-20">
				<div class="colibri-primary-animation"></div>
			</div>
			<div v-else class="p-4">
				<div class="mb-6">
					<div v-if="profileData.bio" v-html="mdInlineRenderer(profileData.bio)" class="text-par-n text-lab-pr2"></div>
					<a v-if="profileDetails.info.website" v-bind:href="profileDetails.info.website" target="_blank" class="mt-2 text-brand-900 text-par-s hover:underline">
						{{ profileDetails.info.website }}
					</a>
				</div>
				<div class="mb-4 border-b border-b-bord-pr">
					<InfoList v-bind:listTitle="$t('labels.information')">
						<InfoListItem 
							iconName="calendar-check-01"
							v-bind:labelText="$t('labels.join_date')"
						v-bind:contentText="profileDetails.info.join_date"></InfoListItem>
						<InfoListItem
							v-if="profileDetails.info.location" 
							iconName="marker-pin-01"
							v-bind:labelText="$t('labels.location')"
						v-bind:contentText="profileDetails.info.location"></InfoListItem>
						<InfoListItem
							v-if="profileDetails.info.birthdate" 
							iconName="stars-01"
							v-bind:labelText="$t('labels.birth_date')"
						v-bind:contentText="profileDetails.info.birthdate"></InfoListItem>
						<InfoListItem
							v-if="profileDetails.info.age" 
							iconName="user-square"
							v-bind:labelText="$t('labels.age')"
						v-bind:contentText="$t('labels.years_old', profileDetails.info.age)"></InfoListItem>
						<InfoListItem
							v-if="profileDetails.info.gender" 
							iconName="face-smile"
							v-bind:labelText="$t('labels.gender')"
						v-bind:contentText="profileDetails.info.gender"></InfoListItem>
					</InfoList>
				</div>
				<div class="mb-4 border-b border-b-bord-pr" v-if="profileDetails.contacts">
					<InfoList v-bind:listTitle="$t('labels.contacts')">
						<InfoListItem 
							v-if="profileDetails.contacts.email"
							iconName="mail-04"
							labelText="E-Mail"
						v-bind:contentText="profileDetails.contacts.email"></InfoListItem>
						<InfoListItem
							v-if="profileDetails.contacts.phone" 
							iconName="phone-01"
							v-bind:labelText="$t('labels.phone')"
						v-bind:contentText="profileDetails.contacts.phone"></InfoListItem>
					</InfoList>
				</div>
				<div class="mb-3" v-if="profileDetails.social_links">
					<div class="flex gap-2">
						<CircleSocialMediaIcon
							v-for="linkItem in profileDetails.social_links"
							v-bind:link="linkItem.url"
						v-bind:iconUrl="linkItem.icon_url"></CircleSocialMediaIcon>
					</div>
				</div>

				<div class="text-cap-s text-lab-sc mb-2">
					{{ $t('labels.profile_private_info_hiding') }}
				</div>
				
				<div class="text-cap-l text-brand-900 mb-2 font-medium">
					{{ $t('labels.last_seen_ago', { time: profileDetails.info.last_active }) }}
				</div>
			</div>

			<template v-slot:loadingSkeleton>
				<div class="flex justify-center py-20">
					<div class="colibri-primary-animation"></div>
				</div>
			</template>
		</ContentModal>
	</Teleport>
</template>

<script>
	import { defineComponent, ref, onMounted, reactive, inject } from 'vue';
	import { colibriAPI } from '@/kernel/services/api-client/native/index.js';
	import { mdInlineRenderer } from '@/kernel/helpers/md/index.js';

	import ContentModal from '@D/components/general/modals/ContentModal.vue';
	import ModalHeader from '@D/components/general/modals/parts/ModalHeader.vue'; 
	import InfoList from '@D/components/general/info/InfoList.vue';
	import InfoListItem from '@D/components/general/info/InfoListItem.vue';
	import CircleSocialMediaIcon from '@D/components/general/social/CircleSocialMediaIcon.vue';

	export default defineComponent({
		emits: ['close'],
		setup() {
			const profileData = inject('profileData');
			const state = reactive({
				isLoading: true
			});

			const profileDetails = ref({});

			onMounted(async () => {
                await colibriAPI().userProfile().params({ id: profileData.value.id }).getFrom('profile/details').then(function(response) {
                    profileDetails.value = response.data.data;
                    state.isLoading = false;
                }).catch(function(error) {
					if(error.response) {
						alert(error.response.data.message);
					}
                });
            });

			return {
				state: state,
				profileDetails: profileDetails,
				profileData: profileData,
				mdInlineRenderer: mdInlineRenderer
			};
		},
		components: {
			ContentModal: ContentModal,
			ModalHeader: ModalHeader,
			InfoList: InfoList,
			InfoListItem: InfoListItem,
			CircleSocialMediaIcon: CircleSocialMediaIcon
		}
	});
</script>