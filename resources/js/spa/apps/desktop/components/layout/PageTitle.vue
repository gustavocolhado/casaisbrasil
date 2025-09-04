<template>
    <div class="flex gap-2 items-center leading-none">
        <div class="shrink-0 cursor-pointer" v-if="hasBack">
            <span v-on:click="goBack" class="text-lab-pr">
                <SvgIcon name="arrow-left" classes="size-icon-normal"></SvgIcon>
            </span>
        </div>
        <div class="flex-1">
            <h1 class="text-title-3 2xl:text-title-1 font-medium text-lab-pr2 tracking-tighter leading-tight">
                {{ titleText }}
            </h1>
        </div>
    </div>
</template>

<script>
    import { defineComponent, ref } from 'vue';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        props: {
            hasBack: {
                type: Boolean,
                default: true
            },
            titleText: {
                type: String,
                default: ''
            },
            backLink: {
                type: String,
                default: ''
            },
            backStep: {
                type: Number,
                default: 1
            },
            backHome: {
                type: Boolean,
                default: false
            }
        },
        setup: function(props) {
            const backLink = ref();
            const router = useRouter();

            if(props.backLink) {
                backLink.value = props.backLink;
            }

            return {
                goBack: () => {
                    if(props.backHome) {
                        router.push({ name: 'home_page' });
                    }
                    else {
                        router.go(-props.backStep);
                    }
                }
            }
        }
    });
</script>