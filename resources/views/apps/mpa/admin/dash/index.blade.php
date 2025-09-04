@extends('adminLayout::index')

@section('pageContent')
    <div class="mb-6">
        <x-page-title titleText=" {{ __('admin/dashboard.title') }}"></x-page-title>
        <x-page-desc>
            {{ __('admin/dashboard.desc') }}
        </x-page-desc>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <x-metric.card title="{{ __('admin/dashboard.metrics.users') }}" value="{{ $metrics['users'] }}" iconName="user-02" iconType="line" />
        <x-metric.card title="{{ __('admin/dashboard.metrics.publications') }}" value="{{ $metrics['publications'] }}" iconName="layout-alt-02" iconType="line" />
        <x-metric.card title="{{ __('admin/dashboard.metrics.products') }}" value="{{ $metrics['products'] }}" iconName="shopping-bag-03" iconType="line" />
        <x-metric.card title="{{ __('admin/dashboard.metrics.jobs') }}" value="{{ $metrics['jobs'] }}" iconName="briefcase-01" iconType="line" />
        <x-metric.card title="{{ __('admin/dashboard.metrics.advertising') }}" value="{{ $metrics['advertising'] }}" iconName="announcement-03" iconType="line" />
        <x-metric.card title="{{ __('admin/dashboard.metrics.stories') }}" value="{{ $metrics['stories'] }}" iconName="refresh-cw-04" iconType="line" />
    </div>

    <x-info.cache-notice :ttl="config('cache.ttl.admin_metrics')"></x-info.cache-notice>
@endsection