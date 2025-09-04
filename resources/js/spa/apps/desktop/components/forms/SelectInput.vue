<template>
    <label v-if="hasLabel" class="mb-1 font-normal tracking-normal block text-lab-sc text-par-s px-1">{{ labelText }}</label>

    <Listbox v-bind:modelValue="selectedOption" v-on:update:modelValue="updateValue" class="relative w-full">
        <div class="relative mt-1 inline-block max-w-full">
            <ListboxButton class="cursor-pointer w-full overflow-hidden bg-input-pr rounded-xl px-5 py-4">
                <span class="flex items-center gap-2 w-full justify-between overflow-hidden">
                    <span v-if="selectedOption" class="flex-1 text-lab-pr2 text-ellipsis truncate text-par-s font-medium text-left">
                        {{ selectedOption.label }}
                    </span>
                    <span class="shrink-0">
                        <SvgIcon name="chevron-down" classes="size-icon-small text-lab-tr"/>
                    </span>
                </span>
            </ListboxButton>
            <ListboxOptions class="absolute py-2 overflow-hidden right-0 left-0 w-full mb-2 divide-y divide-fill-sc rounded-xl backdrop-blur-xs bg-bg-pr/85 shadow-2xl max-h-80 overflow-y-auto focus:outline-hidden z-50">
                <ListboxOption
                    v-for="(listOption) in options"
                    v-bind:key="listOption.value"
                    v-bind:value="listOption"
                v-slot="{ active, selected }">
                        <span v-bind:class="[((active || selected) ? 'bg-fill-qt' : ''), 'block py-2 px-4 cursor-pointer text-par-s text-lab-pr']" v-html=" listOption.label"></span>
                </ListboxOption>
            </ListboxOptions>
        </div>
    </Listbox>

    <div v-if="hasFeedback" class="flex justify-between mt-1 px-1">
        <span v-if="$slots.feedbackInfo" class="inline-flex">
            <span v-if="$slots.feedbackIcon" class="mr-2.5">
                <slot name="feedbackIcon"></slot>
            </span>
            <span class="text-cap-l text-lab-sc">
                <slot name="feedbackInfo"></slot>
            </span>
        </span>
    </div>
</template>

<script>
    import { defineComponent, ref, computed } from 'vue';
    import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';

    export default defineComponent({
        props: {
            hasLabel: {
                type: Boolean,
                default: true
            },
            labelText: {
                type: String,
                default: ''
            },
            hasFeedback: {
                type: Boolean,
                default: true
            },
            options: {
                type: Array,
                default: []
            },
            modelValue: {
                type: [String, Number],
                default: ''
            }
        },
        emits: ['update:modelValue'],
        setup: function(props, context) {
            const selectedOption = computed(() => {
                return props.options.find((option) => {
                    return option.value == props.modelValue;
                });
            });
            
            return {
                selectedOption: selectedOption,
                updateValue: function(event) {
                    context.emit('update:modelValue', event.value);
                }
            };
        },
        components: {
            Listbox: Listbox,
            ListboxButton: ListboxButton,
            ListboxOptions: ListboxOptions,
            ListboxOption: ListboxOption
        }
    });
</script>