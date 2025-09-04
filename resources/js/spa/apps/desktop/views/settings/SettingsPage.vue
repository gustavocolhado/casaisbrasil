<template>
    <CenterContentLayout>
        <RouterView></RouterView>
    </CenterContentLayout>
</template>

<script>
    import { defineComponent } from 'vue';
    import { ref } from 'vue';
    import CenterContentLayout from '@D/components/layout/CenterContentLayout.vue';

    export default defineComponent({
        setup: function() {
        },
        components: {
            CenterContentLayout: CenterContentLayout
        }
    });
</script>