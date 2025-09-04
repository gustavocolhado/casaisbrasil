@extends('adminLayout::index')

@section('pageContent')
    <div class="mb-6">
        <x-page-title titleText=" {{ __('admin/storage.show_title') }} ({{ $diskId }})"></x-page-title>
        <x-page-desc>
            {{ __('admin/storage.show_desc') }}
        </x-page-desc>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2">
        <x-metric.card title="{{ __('labels.image') }}" value="{{ file_size_format($diskStats['image']['content_size']) }}" iconName="image-05" iconType="line" />
        <x-metric.card title="{{ __('labels.video') }}" value="{{ file_size_format($diskStats['video']['content_size']) }}" iconName="video-recorder" iconType="line" />
        <x-metric.card title="{{ __('labels.audio') }}" value="{{ file_size_format($diskStats['audio']['content_size']) }}" iconName="recording-02" iconType="line" />
        <x-metric.card title="{{ __('labels.document') }}" value="{{ file_size_format($diskStats['document']['content_size']) }}" iconName="file-attachment-05" iconType="line" />
    </div>
@endsection