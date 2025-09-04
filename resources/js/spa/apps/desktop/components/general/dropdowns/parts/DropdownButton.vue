<template>
    <PrimaryIconButton iconName="dots-horizontal" iconSize="6"></PrimaryIconButton>
</template>

<script>
    import { defineComponent } from 'vue';
    import PrimaryIconButton from '@D/components/inter-ui/buttons/PrimaryIconButton.vue';

    export default defineComponent({
        components: {
            PrimaryIconButton: PrimaryIconButton
        }
    });
</script>