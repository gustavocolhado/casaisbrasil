<template>
    <div class="flex items-center overflow-hidden gap-2">
        <div class="shrink-0">
            <AvatarSmall 
                v-bind:avatarSrc="avatarSrc"
                v-bind:unreadIndicator="unreadIndicator"
            v-bind:rounded="rounded"></AvatarSmall>
        </div>
        <div class="leading-4 overflow-hidden">
            <RouterLink v-if="hasRoute" v-bind:to="linkRoute" class="cursor-pointer">
                <h3 class="text-par-n font-medium text-lab-pr truncate mb-0.5">
                    {{ name }} <VerificationBadge v-if="verified"></VerificationBadge>
                </h3>
                <p class="text-cap-l text-lab-sc truncate">
                    {{ caption }}
                </p>
            </RouterLink>
            <div v-else>
                <h3 class="text-par-n font-medium text-lab-pr truncate mb-0.5">
                    {{ name }} <VerificationBadge v-if="verified"></VerificationBadge>
                </h3>
                <p class="text-cap-l text-lab-sc truncate">
                    {{ caption }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    import AvatarSmall from '@D/components/general/avatars/AvatarSmall.vue';

    export default defineComponent({
        props: {
            name: {
                type: String,
                default: ''
            },
            verified: {
                type: Boolean,
                default: false
            },
            caption: {
                type: String,
                default: ''
            },
            linkRoute: {
                type: Object,
                default: { name: 'home_page' }
            },
            hasRoute: {
                type: Boolean,
                default: true
            },
            avatarSrc: {
                type: String,
                default: ''
            },
            rounded: {
                type: Boolean,
                default: true
            },
            unreadIndicator: {
                type: Boolean,
                default: false
            }
        },
        components: {
            AvatarSmall: AvatarSmall
        }
    });
</script>