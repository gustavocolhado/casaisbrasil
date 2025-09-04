<template>
    <input
        v-on:input.trim.lazy="inputHandler"
        type="text" 
        class="px-3 h-8 w-full bg-fill-tr border-none hover:ring-1 ring-fill-pr outline-hidden rounded-md text-lab-pr placeholder:font-light placeholder:text-par-s placeholder:text-lab-sc"
    v-bind:placeholder="placeholder">
</template>

<script>
    import { defineComponent, computed, ref } from 'vue';

    export default defineComponent({
        props: {
            placeholder: {
                type: String,
                default: ''
            }
        },
        emit: ['input'],
        setup: function(props, context) {
            return {
                inputHandler: (event) => {
                    context.emit('input', event.target.value);
                }
            };
        }
    });
</script>