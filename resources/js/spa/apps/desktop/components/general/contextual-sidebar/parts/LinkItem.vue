<template>
    <RouterLink v-bind:to="routeData" exactActiveClass="active-settings-tab">
        <div class="flex items-center pr-4 leading-none h-12">
            <span class="shrink-0">
                <SvgIcon v-bind:type="iconType" v-bind:name="iconName" v-bind:classes="['size-icon-normal', ...linkColor].join(' ')"></SvgIcon>
            </span>
            <span v-bind:class="['ml-2', 'text-par-m', ...linkColor]">
                {{ textLabel }}
            </span>
            <span class="shrink-0 ml-auto">
                <SvgIcon name="chevron-right" classes="size-5 text-lab-sc"></SvgIcon>
            </span>
        </div>
    </RouterLink>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            linkColor: {
                type: Array,
                default: ['text-lab-pr']
            },
            routeData: {
                type: Object,
                default: {}
            },
            iconType: {
                type: String,
                default: 'line'
            },
            iconName: {
                type: String,
                default: ''
            },
            textLabel: {
                type: String,
                default: ''
            }
        }
    });
</script>