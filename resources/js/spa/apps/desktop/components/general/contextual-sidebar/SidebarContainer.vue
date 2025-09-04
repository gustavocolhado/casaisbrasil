<template>
    <div class="h-full border-r border-fill-sc pb-12 overflow-y-auto sticky-bar-bottom-offset">
        <div v-if="$slots.sidebarTitle" class="mt-top-offset">
            <slot name="sidebarTitle"></slot>
        </div>

        <div class="block">
            <slot name="sidebarBody"></slot>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        setup: function() {
        }
    });
</script>