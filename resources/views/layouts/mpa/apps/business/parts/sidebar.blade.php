<x-sidebar.container>
    <x-sidebar.action-bar>
        <div class="flex justify-center mb-4">
            <a href="{{ route('business.settings.index') }}" class="size-10 rounded-full overflow-hidden">
                <img class="size-full" src="{{ me()->avatar_url }}" alt="Image">
            </a>
        </div>
        
        <x-ui.dropdown.dropdown :classes="['origin-bottom-right', 'top-0', 'left-14']">
            <x-slot:dropdownButton>
                <x-sidebar.action class="bg-fill-tr text-brand-900" tag="button" icon="plus" iconType="solid" />
            </x-slot:dropdownButton>

            <x-ui.dropdown.item tag="a" itemText="{{ __('business/labels.campaign') }}" href="{{ route('business.ads.create') }}">
                <x-slot:itemIcon>
                    <x-ui-icon type="line" name="announcement-03"></x-ui-icon>
                </x-slot:itemIcon>
            </x-ui.dropdown.item>

            <x-ui.dropdown.item tag="a" itemText="{{ __('business/labels.product') }}" href="{{ route('business.market.create') }}">
                <x-slot:itemIcon>
                    <x-ui-icon type="line" name="shopping-bag-03"></x-ui-icon>
                </x-slot:itemIcon>
            </x-ui.dropdown.item>

            <x-ui.dropdown.item tag="a" itemText="{{ __('business/labels.job') }}" href="{{ route('business.jobs.create') }}">
                <x-slot:itemIcon>
                    <x-ui-icon type="line" name="briefcase-01"></x-ui-icon>
                </x-slot:itemIcon>
            </x-ui.dropdown.item>
        </x-ui.dropdown.dropdown>

        <div class="mt-auto flex flex-col gap-1 text-lab-sc">
            <x-sidebar.action href="{{ route('document.help.index') }}" icon="help-circle" iconType="line" />
            <x-sidebar.action href="{{ route('user.desktop.index') }}" icon="log-out-04" iconType="line" />
        </div>
    </x-sidebar.action-bar>

    <x-sidebar.navbar>
        <div class="mb-6">
            <x-sidebar.user-card name="{{ me()->name }}" caption="{{ me()->caption }}" link="{{ url('wallet') }}">
                <x-slot:footer>
                    <a href="{{ url('wallet') }}" target="_blank" class="flex px-4 py-3 group">
                        <div class="flex-1">
                            <p class="text-lab-sc text-par-s">
                                {{ __('business/labels.balance') }} <span class="text-mint font-medium">{{ me()->wallet->balance->getFormattedAmount() }}</span>
                            </p>
                        </div>
                        <div class="shrink-0 size-4 text-lab-sc group-hover:text-brand-900">
                            <x-ui-icon type="solid" name="link-external-01"></x-ui-icon>
                        </div>
                    </a>
                </x-slot:footer>
            </x-sidebar.user-card>
        </div>
        <x-sidebar.navlist>
            <x-sidebar.navlist-item
                href="{{ route('business.dashboard.index') }}"
                iconName="home-smile"
                iconType="line"
                :current="route_is('business.dashboard.*')"
            text="{{ __('business/labels.overview') }}"/>

            <x-sidebar.navlist-item
                href="{{ route('business.ads.index') }}"
                iconName="announcement-03"
                iconType="line"
                :current="route_is('business.ads.*')"
            text="{{ __('business/labels.campaign') }}"/>

            <x-sidebar.navlist-item
                href="{{ route('business.market.index') }}"
                iconName="shopping-bag-03"
                iconType="line"
                :current="route_is('business.market.*')"
            text="{{ __('business/labels.marketplace') }}"/>

            <x-sidebar.navlist-item
                href="{{ route('business.jobs.index') }}"
                iconName="briefcase-01"
                iconType="line"
                :current="route_is('business.jobs.*')"
            text="{{ __('business/labels.jobs') }}"/>

            <x-sidebar.navlist-div/>

            <x-sidebar.navlist-item
                href="{{ route('business.wallet.index') }}"
                iconName="wallet-03"
                iconType="line"
                :current="route_is('business.wallet.*')"
            text="{{ __('business/labels.wallet') }}"/>

            <x-sidebar.navlist-item
                href="{{ route('business.settings.index') }}"
                iconName="settings-01"
                iconType="line"
                :current="route_is('business.settings.*')"
            text="{{ __('business/labels.account_settings') }}"/>

            <x-sidebar.navlist-item
                href="{{ route('business.affiliate.index') }}"
                iconName="currency-euro"
                iconType="line"
                :current="route_is('business.affiliate.*')"
            text="{{ __('business/labels.affiliate_program') }}"/>
            <x-sidebar.navlist-div/>

            <x-sidebar.navlist-item
                href="{{ route('document.help.index') }}"
                iconName="help-circle"
                iconType="line"
            text="{{ __('business/labels.help') }}"/>

            <x-sidebar.navlist-item
                href="{{ config('business.links.business_account_guide') }}"
                iconName="arrow-up-right"
                iconType="line"
            text="{{ __('business/labels.about_account') }}"/>
        </x-sidebar.navlist>
		<div class="mt-auto">
			<div class="flex flex-wrap gap-1">
                <x-sidebar.link href="{{ url('settings/theme') }}" target="_blank">
                    {{ __('labels.theme') }}
                </x-sidebar.link>
                <x-sidebar.link href="{{ route('document.help.index') }}" target="_blank">
                    {{ __('business/labels.help') }}
                </x-sidebar.link>
                <x-sidebar.link href="{{ route('document.developers.index') }}" target="_blank">
                    {{ __('business/labels.for_developers') }}
                </x-sidebar.link>
                <x-sidebar.link href="{{ route('document.privacy.index') }}" target="_blank">
                    {{ __('business/labels.privacy_policy') }}
                </x-sidebar.link>
                <x-sidebar.link href="{{ route('document.terms.index') }}" target="_blank">
                    {{ __('business/labels.terms_of_use') }}
                </x-sidebar.link>
                <x-sidebar.link href="{{ url('settings/language') }}" target="_blank">
                    {{ __('business/labels.language') }}
                </x-sidebar.link>
            
                <x-sidebar.link href="{{ url('/') }}" target="_blank">{{ config('app.name') }} &copy; {{ now()->year }}</x-sidebar.link>
                
                @unless(config('app.hide_author_attribution'))
                    <x-sidebar.link href="https://www.terla.me" target="_blank">Created by Mansur Terla</x-sidebar.link>
                @endunless
			</div>
		</div>
    </x-sidebar.navbar>
</x-sidebar.container>