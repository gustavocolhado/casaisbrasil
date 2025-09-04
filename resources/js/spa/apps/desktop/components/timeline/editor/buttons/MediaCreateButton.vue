<template>
    <button class="size-icon-small disabled:opacity-70 outline-hidden" type="button" v-bind:disabled="disabled">
        <SvgIcon v-bind:type="iconType" v-bind:name="iconName" classes="size-full text-brand-900"></SvgIcon>
    </button>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            iconName: {
                type: String,
                default: ''
            },
            iconType: {
                type: String,
                default: 'line'
            },
            disabled: {
                type: Boolean,
                default: false
            }
        }
    });
</script>