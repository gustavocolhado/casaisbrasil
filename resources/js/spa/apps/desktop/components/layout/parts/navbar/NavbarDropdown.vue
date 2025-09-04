<template>
    <Menu as="div" class="relative cursor-pointer z-50 text-lab-sc">
        <MenuButton>
            <span class="flex items-center ">
                <span class="size-icon-normal shrink-0 opacity-80">
                    <SvgIcon name="dots-horizontal" type="solid"></SvgIcon>
                </span>
                <span class="text-par-l ml-3">
                    {{ $t('labels.more') }}
                </span>
            </span>
        </MenuButton>

        <PrimaryTransition>
            <MenuItems class="origin-bottom-right bottom-full left-0 relative dropdown-menu w-80 z-50">
                <div v-if="isAdmin" class="block">
                    <MenuItem v-slot="{ active, close }">
                        <button class="group flex w-full items-center px-4 py-1">
                            <a v-bind:href="adminPanelUrl" target="_blank" class="block w-full" v-on:click="close">
                                <span class="w-full flex items-center overflow-hidden">
                                    <span class="shrink-0 size-icon-normal">
                                        <SvgIcon type="line" name="shield-02" classes="size-full"></SvgIcon>
                                    </span>
                                    <span class="dropdown-item-label">
                                        {{ $t('labels.admin_panel') }}
                                    </span>
                                </span>
                            </a>
                        </button>
                    </MenuItem>
                </div>
                <div class="block">
                    <MenuItem v-slot="{ active, close }">
                        <button class="group flex w-full items-center px-4 py-1">
                            <RouterLink v-bind:to="{ name: 'settings_page' }" class="block w-full" v-on:click="close">
                                <span class="w-full flex items-center overflow-hidden">
                                    <span class="shrink-0 size-icon-normal">
                                        <SvgIcon type="line" name="settings-01" classes="size-full"></SvgIcon>
                                    </span>
                                    <span class="dropdown-item-label">
                                        {{ $t('labels.account_settings') }}
                                    </span>
                                </span>
                            </RouterLink>
                        </button>
                    </MenuItem>
                </div>
                <div v-if="$config('features.wallet.enabled')" class="block">
                    <MenuItem v-slot="{ active, close }">
                        <button class="group flex w-full items-center px-4 py-1">
                            <RouterLink v-bind:to="{ name: 'wallet_page' }"  class="block w-full" v-on:click="close">
                                <span class="w-full flex items-center overflow-hidden">
                                    <span class="shrink-0 size-icon-normal">
                                        <SvgIcon type="line" name="wallet-02" classes="size-full"></SvgIcon>
                                    </span>
                                    <span class="dropdown-item-label">
                                        {{ $t('labels.wallet') }}
                                    </span>
                                </span>
                            </RouterLink>
                        </button>
                    </MenuItem>
                </div>
                <div class="block">
                    <MenuItem>
                        <button v-on:click="logoutUser" class="group flex w-full items-center px-4 py-1">
                            <span class="w-full flex items-center overflow-hidden">
                                <span class="shrink-0 size-icon-normal">
                                    <SvgIcon name="log-out-01" type="solid" classes="size-full"></SvgIcon>
                                </span>
                                <span class="dropdown-item-label">
                                    {{ $t('labels.logout') }}
                                </span>
                            </span>
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </PrimaryTransition>
    </Menu>
</template>
<script>
    import { defineComponent, computed } from 'vue';
    import { useRouter } from 'vue-router';
    import { useAuthStore } from '@D/store/auth/auth.store.js';
    import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

    export default defineComponent({
        setup: function(props) {
            const Router = useRouter();
            const authStore = useAuthStore();

            return {
                isAdmin: computed(() => {
                    return authStore.userData.meta.is_admin;
                }),
                adminPanelUrl: computed(() => {
                    return authStore.userData.meta.admin.url;
                }),
                logoutUser: async () => {
                    await authStore.logoutUser();

                    window.location.href = embedder('routes.user_auth_index');
                }
            }
        },
        components: {
            Menu: Menu,
            MenuButton: MenuButton,
            MenuItems: MenuItems,
            MenuItem: MenuItem
        }
    });
</script>
