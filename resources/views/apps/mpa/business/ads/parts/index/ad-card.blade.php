<x-cards.timeline.card>
    <div class="mb-2">
        <a href="{{ route('business.ads.show', ['adId' => $adData->id]) }}" class="block">
            <x-cards.timeline.image imageUrl="{{ $adData->preview_image_url }}"></x-cards.timeline.image>
        </a>
    </div>
    <div class="mb-4">
        <x-cards.timeline.content
            content="{{ $adData->content }}"
            link="{{ route('business.ads.show', ['adId' => $adData->id]) }}"
            title="{{ $adData->title }}"></x-cards.timeline.content>
    </div>
    
    <div class="flex flex-col gap-1 mb-6">
        @if($adData->approval->isPending())
            <x-cards.timeline.value value="{{ $adData->approval->label() }} {{ $adData->approval->emoji() }}"></x-cards.timeline.value>
        @else
            <x-cards.timeline.value value="{{ $adData->status->label() }} {{ $adData->status->emoji() }}"></x-cards.timeline.value>
        @endif

        <x-cards.timeline.value value="{{ __('business/ads.spent', ['amount' => $adData->formatted_spent_budget, 'total' => $adData->formatted_total_budget]) }}"></x-cards.timeline.value>
        <x-cards.timeline.value value="ID {{ $adData->formatted_id }}"></x-cards.timeline.value>
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
            <x-cards.timeline.value value="{{ __('business/ads.ad_from', ['date' => $adData->created_at->getFormatted()]) }}"></x-cards.timeline.value>
        </div>
        <div class="flex flex-col gap-1">
            <x-cards.timeline.value value="{{ __('labels.views') }} {{ $adData->formatted_views_count }}" rightAlign="true"></x-cards.timeline.value>
        </div>
    </div>
</x-cards.timeline.card>