<x-header logo="{{ $logotypeUrl }}" name="{{ __('admin/labels.admin_panel') }}" link="{{ route('admin.dash.index') }}">
    <x-slot:controls>
        <x-header-btn link="{{ route('admin.cache.reset') }}" btnText="{{ __('admin/labels.reset_cache') }}" iconName="data" iconType="solid"></x-header-btn>
    </x-slot:controls>
</x-header>