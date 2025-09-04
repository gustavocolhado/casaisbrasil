<template>
    <SidebarContainer>
        <template v-slot:sidebarTitle>
            <div class="pl-6 mb-8">
                <PageTitle v-bind:hasBack="false" v-bind:titleText="$t('labels.account_settings')"></PageTitle>
            </div>
        </template>

        <template v-slot:sidebarBody>
            <div class="pl-6">
                <LinksGroupTitle v-bind:textLabel="$t('settings.settings_and_privacy')"></LinksGroupTitle>

                <div class="block">
                    <LinkItem
                        iconName="user-01"
                        v-bind:textLabel="$t('settings.your_account')"
                    v-bind:routeData="{ name: 'account_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="fingerprint-04"
                        iconType="solid"
                        v-bind:textLabel="$t('settings.account_credentials')"
                    v-bind:routeData="{ name: 'account_credentials_page' }"></LinkItem>

                    <LinkItem
                        iconName="bell-01"
                        v-bind:textLabel="$t('labels.notifications')"
                    v-bind:routeData="{ name: 'notifications_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="file-shield-01"
                        v-bind:textLabel="$t('settings.account_privacy')"
                    v-bind:routeData="{ name: 'account_privacy_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="translate-01"
                        v-bind:textLabel="$t('labels.language')"
                    v-bind:routeData="{ name: 'language_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="whatsapp"
                        iconType="social"
                        v-bind:textLabel="$t('labels.social_media')"
                    v-bind:routeData="{ name: 'social_media_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="moon-02"
                        v-bind:textLabel="$t('labels.theme')"
                    v-bind:routeData="{ name: 'theme_settings_page' }"></LinkItem>
                </div>

                <LinksGroupDivider></LinksGroupDivider>

                <LinksGroupTitle v-bind:textLabel="$t('settings.personal_info_and_verification')"></LinksGroupTitle>

                <div class="block">
                    <LinkItem
                        iconName="file-shield-03"
                        v-bind:textLabel="$t('settings.personal_info')"
                    v-bind:routeData="{ name: 'personal_info_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="check-verified-02"
                        v-bind:textLabel="$t('settings.account_verification')"
                    v-bind:routeData="{ name: 'verification_page' }"></LinkItem>
                </div>

                <LinksGroupDivider></LinksGroupDivider>

                <LinksGroupTitle v-bind:textLabel="$t('settings.blocked_accounts')"></LinksGroupTitle>

                <div class="block">
                    <LinkItem
                        iconName="slash-circle-01"
                        v-bind:textLabel="$t('settings.blocked_people')"
                    v-bind:routeData="{ name: 'blocked_settings_page' }"></LinkItem>
                </div>

                <LinksGroupDivider></LinksGroupDivider>

                <LinksGroupTitle v-bind:textLabel="$t('settings.advanced_settings')"></LinksGroupTitle>
                
                <div class="block">
                    <LinkItem
                        iconName="keyboard-01"
                        v-bind:textLabel="$t('settings.hotkeys_settings')"
                    v-bind:routeData="{ name: 'hotkey_settings_page' }"></LinkItem>

                    <LinkItem
                        iconName="folder-code"
                        v-bind:textLabel="$t('settings.api_for_developers')"
                    v-bind:routeData="{ name: 'api_settings_page' }"></LinkItem>
                </div>
                <LinksGroupDivider></LinksGroupDivider>

                <LinksGroupTitle v-bind:textLabel="$t('settings.additional_settings')"></LinksGroupTitle>
                
                <div class="block">
                    <LinkItem
                        iconName="alert-triangle"
                        v-bind:linkColor="['text-red-900']"
                        v-bind:textLabel="$t('settings.account_actions')"
                    v-bind:routeData="{ name: 'actions_settings_page' }"></LinkItem>
                </div>
            </div>
        </template>
    </SidebarContainer>
</template>

<script>
    import { defineComponent } from 'vue';

    import PageTitle from '@D/components/layout/PageTitle.vue';
    import SidebarContainer from '@D/components/general/contextual-sidebar/SidebarContainer.vue';
    import LinksGroupTitle from '@D/components/general/contextual-sidebar/parts/LinksGroupTitle.vue';
    import LinkItem from '@D/components/general/contextual-sidebar/parts/LinkItem.vue';
    import LinksGroupDivider from '@D/components/general/contextual-sidebar/parts/LinksGroupDivider.vue';

    export default defineComponent({
        components: {
            PageTitle: PageTitle,
            SidebarContainer: SidebarContainer,
            LinksGroupTitle: LinksGroupTitle,
            LinkItem: LinkItem,
            LinksGroupDivider: LinksGroupDivider
        }
    });
</script>