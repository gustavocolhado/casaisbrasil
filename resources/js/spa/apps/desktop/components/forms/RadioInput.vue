<template>
    <div class="block">
        <label v-if="hasLabel" class="mb-2 font-normal tracking-normal block text-lab-pr3 text-par-s">{{ labelText }}</label>

        <div class="block">
            <RadioGroup v-model="selectedOption" class="inline-flex divide-x divide-bord-card overflow-hidden rounded-xl">
                <RadioGroupOption 
                    v-for="radioOption in options"
                    v-bind:key="radioOption.value"
                    v-slot="{ checked }" 
                    v-bind:value="radioOption.value"
                class="bg-input-pr px-6 py-4 cursor-pointer text-par-s">

                    <span v-bind:class="checked ? 'text-brand-900' : 'text-lab-pr'">{{ radioOption.label }}</span>
                </RadioGroupOption>
            </RadioGroup>
        </div>

        <div v-if="hasFeedback" class="block">
            <span v-if="$slots.feedbackInfo" class="inline-flex">
                <span v-if="$slots.feedbackIcon" class="mr-2.5">
                    <slot name="feedbackIcon"></slot>
                </span>
                <span class="text-cap-l text-lab-sc">
                    <slot name="feedbackInfo"></slot>
                </span>
            </span>
        </div>
    </div>
</template>

<script>
    import { defineComponent, ref, watch } from 'vue';
    import { RadioGroup, RadioGroupOption } from '@headlessui/vue';

    export default defineComponent({
        props: {
            hasLabel: {
                type: Boolean,
                default: true
            },
            hasFeedback: {
                type: Boolean,
                default: true
            },
            labelText: {
                type: String,
                default: ''
            },
            classes: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: ''
            },
            modelValue: {
                type: String,
                default: ''
            },
            options: {
                type: Array,
                default: []
            }
        },
        emits: ['update:modelValue'],
        components:{
            RadioGroup: RadioGroup,
            RadioGroupOption: RadioGroupOption
        },
        setup: function(props, context) {
            const selectedOption = ref(props.modelValue);

            watch(selectedOption, (value) => {
                context.emit('update:modelValue', value);
            });

            return {
                selectedOption: selectedOption
            }
        }
    });
</script>