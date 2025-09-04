<template>
    <button class="leading-none rounded-full font-medium disabled:opacity-60 cursor-pointer" v-bind:type="buttonType" v-bind:disabled="disableButton" v-bind:class="[btnStylingClasses, btnSizes[buttonSize], ((buttonFluid) ? 'w-full' : '')]">
        <span v-if="loading" class="inline-block px-4"><div class="colibri-primary-animation"></div></span>
        <span v-else>{{ buttonText }}</span>
    </button>
</template>

<script>
    import { defineComponent, computed } from 'vue';

    export default defineComponent({
        props: {
            loading: {
                type: Boolean,
                default: false
            },
            buttonText: {
                type: String,
                default: 'Label'
            },
            buttonType: {
                type: String,
                default: 'button'
            },
            buttonSize: {
                type: String,
                default: 'lg'
            },
            buttonFluid: {
                type: Boolean,
                default: false
            },
            isDisabled: {
                type: Boolean,
                default: false
            },
            buttonRole: {
                type: String,
                default: 'default'
            }
        },
        setup: function(props) {
            const btnStyles = {
                accent: 'bg-lab-pr2 text-bg-pr',
                stroked: 'text-brand-900 border-brand-900 border',
                default: 'text-brand-900 bg-fill-qt',
                danger: 'text-red-900 bg-fill-qt hover:bg-fill-qt',
                marginal: 'text-lab-sc hover:bg-fill-qt',
                marginalDisabled: 'text-lab-sc',
                marginalDanger: 'text-red-900 hover:bg-fill-qt'
            };

            const btnSizes = {
                lg: 'py-4 px-5 text-par-m',
                lm: 'py-3.5 px-6 text-par-s',
                md: 'py-2.5 px-4 text-par-s'
            };

            return {
                btnSizes: btnSizes,
                btnStylingClasses: computed(() => {
                    if (props.buttonRole === 'accent' && props.loading) {
                        return btnStyles['default'];
                    }

                    return btnStyles[props.buttonRole];
                }),
                disableButton: computed(() => {
                    return props.loading || props.isDisabled;
                })
            }
        }
    });
</script>