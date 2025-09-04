<template>
	<div class="block py-40">
		<TimelineEmptyState v-bind:desc="$t('empty_state.profile.activity.desc')"></TimelineEmptyState>
	</div>
</template>

<script>
	import { defineComponent } from 'vue';
	import TimelineEmptyState from '@D/components/timeline/state/TimelineEmptyState.vue';

	export default defineComponent({
		props: {
			
		},
		setup(props, context) {
			return {
				
			};
		},
		components: {
			TimelineEmptyState: TimelineEmptyState
		}
	});
</script>