<template>
    <div class="text-lab-sc text-par-s mb-2" v-html="textLabel">
    </div>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            textLabel: {
                type: String,
                default: ''
            }
        },
        setup: function() {
        }
    });
</script>