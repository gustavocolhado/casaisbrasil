@extends('adminLayout::index')

@section('pageContent')
	<div class="mb-12">
        <x-page-title titleText=" {{ __('admin/users.index_title') }}"></x-page-title>
        <x-page-desc>
            {{ __('admin/users.index_desc') }}
        </x-page-desc>
    </div>

	<x-table.table>
		<x-table.thead>
			<x-table.th>{{ __('table.labels.full_name') }}</x-table.th>
			<x-table.th>{{ __('table.labels.email') }}</x-table.th>
			<x-table.th>{{ __('table.labels.country') }}</x-table.th>
			<x-table.th>IP</x-table.th>
			<x-table.th>{{ __('table.labels.joined_at') }}</x-table.th>
			<x-table.th>{{ __('table.labels.last_seen') }}</x-table.th>
			<x-table.th>#ID</x-table.th>
		</x-table.thead>
		<x-table.tbody>
			@if($users->isNotEmpty())
				@foreach ($users as $userData)
					@include('admin::users.index.parts.user-item', [
						'userData' => $userData,
					])
				@endforeach
			@else
				<x-table.empty colspan="7"></x-table.empty>
			@endif
		</x-table.tbody>
	</x-table.table>

	@unless($users->isEmpty())
		<div class="mt-4">
			{{ $users->onEachSide(1)->withQueryString()->links('pagination.index') }}
		</div>
	@endunless
@endsection