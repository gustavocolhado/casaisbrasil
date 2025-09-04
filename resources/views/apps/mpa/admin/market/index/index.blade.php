@extends('adminLayout::index')

@section('pageContent')
	<div class="mb-8">
        <x-page-title titleText=" {{ __('admin/market.index_title') }}"></x-page-title>
        <x-page-desc>
            {{ __('admin/market.index_desc') }}
        </x-page-desc>
    </div>

	<x-table.table>
		<x-table.thead>
			<x-table.th>{{ __('table.labels.seller') }}</x-table.th>
			<x-table.th>{{ __('table.labels.title') }}</x-table.th>
			<x-table.th>{{ __('table.labels.category') }}</x-table.th>
			<x-table.th>{{ __('table.labels.approval') }}</x-table.th>
			<x-table.th>{{ __('table.labels.status') }}</x-table.th>
			<x-table.th>{{ __('table.labels.price') }}</x-table.th>
			<x-table.th>{{ __('table.labels.created_at') }}</x-table.th>
			<x-table.th>#ID</x-table.th>
			<x-table.th>{{ __('labels.table.actions') }}</x-table.th>
		</x-table.thead>
		<x-table.tbody>
			@if($products->isNotEmpty())
				@foreach ($products as $productData)
					@include('admin::market.index.parts.product-item', [
						'productData' => $productData
					])
				@endforeach
			@else
				<x-table.empty colspan="9"></x-table.empty>
			@endif
		</x-table.tbody>
	</x-table.table>

	@unless($products->isEmpty())
		<div class="mt-4">
			{{ $products->onEachSide(1)->withQueryString()->links('pagination.index') }}
		</div>
	@endunless
@endsection