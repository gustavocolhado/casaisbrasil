<template>
    <RouterLink v-bind:to="link" v-slot="{ isActive }" class="py-4 flex-1 px-3 text-center overflow-hidden truncate leading-4 tracking-tighter" activeClass="active-tab-link">
        <span v-bind:class="['text-par-m font-medium tracking-tighter', (isActive ? 'text-lab-pr2' : 'text-lab-pr3')]">
            <slot></slot>
        </span>
    </RouterLink>
</template>

<script>
    import { defineComponent } from 'vue';
    export default defineComponent({
        props: {
            link: {
                type: Object,
                default: { name: 'home_page' }
            },
            active: {
                type: Boolean,
                default: false
            }
        }
    });
</script>