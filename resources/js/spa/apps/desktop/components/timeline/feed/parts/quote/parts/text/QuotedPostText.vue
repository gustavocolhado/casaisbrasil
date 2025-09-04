<template>
    <div class="block">
        <div class="line-clamp-[7] content-text leading-5 text-lab-pr2 text-par-n tracking-tight font-normal publication-text break-words" v-html="mdInlineRenderer(postContent)"></div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
	import { mdInlineRenderer } from '@/kernel/helpers/md/index.js';

    export default defineComponent({
        props: {
            postContent: {
                type: String,
                default: ''
            }
        },
        setup: function() {
            return {
				mdInlineRenderer: mdInlineRenderer
            };
        }
    });
</script>