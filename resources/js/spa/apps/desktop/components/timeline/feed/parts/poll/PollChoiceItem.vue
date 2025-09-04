<template>
    <div class="block">
        <div v-on:click="vote(index)" 
                class="px-3 py-2 bg-fill-qt overflow-hidden rounded-md relative"
            v-bind:class="[(! choiceItem.has_voted_choice && hasVotedPoll) ? 'cursor-default opacity-80' : 'cursor-pointer']">

            <div class="h-full absolute top-0 left-0 rounded-xs overflow-hidden w-full flex">
                <div class="max-w-full h-full bg-brand-900/10 smoothing" v-bind:style="{ width: `${choiceItem.percentage}%` }"></div>
            </div>
            <div class="flex justify-between items-center leading-none relative z-10">
                <div class="size-4 shrink-0">
                    <template v-if="choiceItem.has_voted_choice">
                        <SvgIcon type="solid" name="check-circle" classes="size-full text-brand-900"></SvgIcon>
                    </template>
                    <template v-else>
                        <SvgIcon type="line" name="circle" classes="size-full text-lab-sc"></SvgIcon>
                    </template>
                </div>
                <div class="flex-1 flex justify-between text-brand-900 overflow-hidden ml-3 items-center">
                    <span class="text-par-s flex-1 truncate mr-4 leading-normal">
                        {{ choiceItem.choice_text }}
                    </span>
                    <span class="text-par-s">{{ choiceItem.percentage }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent, computed, ref } from 'vue';

    export default defineComponent({
        props: {
            choiceItem: {
                type: Object,
                default: {}
            },
            index: {
                type: Number,
                default: 0
            },
            hasVotedPoll: {
                type: Boolean,
                default: false
            }
        },
        emits: ['vote'],
        setup: function(props, context) {
            const choiceItem = computed(() => {
                return props.choiceItem;
            });

            return {
                choiceItem,
                vote: function(index) {
                    context.emit('vote', index);
                }
            };
        }
    });
</script>