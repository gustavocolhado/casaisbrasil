<template>
    <div class="block p-4 cursor-pointer border border-bord-pr rounded-2xl mb-4 last:mb-0" v-bind:class="isActive ? 'bg-fill-fv' : ''">
        <div class="mb-2">
            <AvatarRightSided
                v-bind:avatarSrc="publisher.avatar_url"
                v-bind:name="publisher.name"
                v-bind:verified="publisher.verified"
                v-bind:linkRoute="{ name: 'profile_page', params: { id: publisher.username } }"
            v-bind:caption="publisher.caption"></AvatarRightSided>
        </div>
        <div class="block mb-4">
            <h4 class="text-par-l w-8/12 font-medium text-lab-pr tracking-tighter leading-tight line-clamp-2 mb-2">
                {{ jobData.title }}
            </h4>
            <p class="text-par-s text-lab-sc mb-2 tracking-normal font-light">
                {{ jobData.category_name }}, {{ jobData.is_remote ? $t('job.remote_job') : $t('job.office_job') }}
            </p>
            <div v-if="jobData.is_urgent" class="mb-4">
                <JobHighlighter v-bind:labelText="$t('job.urgent_order')"></JobHighlighter>
            </div>
            <p class="text-par-s text-lab-pr line-clamp-3">
                {{ jobData.overview }}
            </p>
        </div>
        <div class="flex justify-between overflow-hidden">
            <span class="text-par-s text-lab-sc truncate">{{ jobData.type.label }}</span>
            <span class="text-par-s text-lab-sc">
                {{ jobData.is_start_income ? $t('job.income_from', { amount: jobData.income.formatted }) : $t('job.income_to', { amount: jobData.income.formatted }) }}
            </span>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed } from 'vue';
    import AvatarRightSided from '@D/components/general/avatars/sided/small/AvatarRightSided.vue';
    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';
	import ViewsCounter from '@D/components/general/counters/ViewsCounter.vue';
    import JobHighlighter from '@D/views/jobs/children/jobsboard/parts/JobHighlighter.vue';

    // This component is used to display a job card in the jobsboard.
    // It is used in the JobsIndex component and the JobBookmarksPage component.
    // Changes to this component will affect both the jobsboard and the bookmarks page.

    export default defineComponent({
        props: {
            jobData: {
                type: Object,
                default: {}
            },
            isActive: {
                type: Boolean,
                default: false
            }
        },
        setup: function(props) {
            return {
                publisher: computed(() => {
                    return props.jobData.relations.user;
                })
            }
        },
        components: {
            AvatarRightSided: AvatarRightSided,
            PrimaryIconButton: PrimaryIconButton,
			ViewsCounter: ViewsCounter,
            JobHighlighter: JobHighlighter
        }
    });
</script>