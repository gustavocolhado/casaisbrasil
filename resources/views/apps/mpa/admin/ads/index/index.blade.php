@extends('adminLayout::index')

@section('pageContent')
	<div class="mb-12">
        <x-page-title titleText=" {{ __('admin/ads.index_title') }}"></x-page-title>
        <x-page-desc>
            {{ __('admin/ads.index_desc') }}
        </x-page-desc>
    </div>

	<x-table.table>
		<x-table.thead>
			<x-table.th>{{ __('table.labels.author') }}</x-table.th>
			<x-table.th>{{ __('table.labels.title') }}</x-table.th>
			<x-table.th>{{ __('table.labels.status') }}</x-table.th>
			<x-table.th>{{ __('table.labels.approval') }}</x-table.th>
			<x-table.th>{{ __('table.labels.total_budget') }}</x-table.th>
			<x-table.th>{{ __('table.labels.spends') }}</x-table.th>
			<x-table.th>#ID</x-table.th>
			<x-table.th>{{ __('labels.table.actions') }}</x-table.th>
		</x-table.thead>
		<x-table.tbody>
			@if($ads->isNotEmpty())
				@foreach ($ads as $adData)
					@include('admin::ads.index.parts.ad-item', [
						'adData' => $adData
					])
				@endforeach
			@else
				<x-table.empty colspan="8"></x-table.empty>
			@endif
		</x-table.tbody>
	</x-table.table>

	@unless($ads->isEmpty())
		<div class="mt-4">
			{{ $ads->onEachSide(1)->withQueryString()->links('pagination.index') }}
		</div>
	@endunless
@endsection