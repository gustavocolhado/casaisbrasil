@extends('adminLayout::index')

@section('pageContent')
	<div class="mb-8">
        <x-page-title titleText=" {{ __('admin/jobs.index_title') }}"></x-page-title>
        <x-page-desc>
            {{ __('admin/jobs.index_desc') }}
        </x-page-desc>
    </div>

	<x-table.table>
		<x-table.thead>
			<x-table.th>{{ __('table.labels.author') }}</x-table.th>
			<x-table.th>{{ __('table.labels.title') }}</x-table.th>
			<x-table.th>{{ __('table.labels.category') }}</x-table.th>
			<x-table.th>{{ __('table.labels.approval') }}</x-table.th>
			<x-table.th>{{ __('table.labels.status') }}</x-table.th>
			<x-table.th>{{ __('table.labels.income') }}</x-table.th>
			<x-table.th>{{ __('table.labels.created_at') }}</x-table.th>
			<x-table.th>#ID</x-table.th>
			<x-table.th>{{ __('labels.table.actions') }}</x-table.th>
		</x-table.thead>
		<x-table.tbody>
			@if($jobs->isNotEmpty())
				@foreach ($jobs as $jobData)
					@include('admin::jobs.index.parts.job-item', [
						'jobData' => $jobData
					])
				@endforeach
			@else
				<x-table.empty colspan="9"></x-table.empty>
			@endif
		</x-table.tbody>
	</x-table.table>

	@unless($jobs->isEmpty())
		<div class="mt-4">
			{{ $jobs->onEachSide(1)->withQueryString()->links('pagination.index') }}
		</div>
	@endunless
@endsection