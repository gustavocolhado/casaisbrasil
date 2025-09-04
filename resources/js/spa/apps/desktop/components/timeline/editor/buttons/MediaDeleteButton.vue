<template>
    <div class="leading-none z-10 inline-block bg-bg-pr/80 rounded-full border border-fill-tr">
        <PrimaryIconButton name="x"></PrimaryIconButton>
    </div>
</template>

<script>
    import { defineComponent, computed, ref } from 'vue';

    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';

    export default defineComponent({
        props: {
        },
        setup: function(props) {
            return {
            };
        },
        components: {
            PrimaryIconButton: PrimaryIconButton
        }
    });
</script>