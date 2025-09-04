@props([
	'link' => '#',
	'icon' => 'grid-01',
	'iconType' => 'line',
	'tag' => 'a'
])

<div class="w-action-bar flex justify-center">
	<{{ $tag }} class="size-10 cursor-pointer rounded-full overflow-hidden flex-center {{ $attributes->get('class') }}" {{ $attributes }}>
		<span class="size-icon-normal">
			<x-ui-icon name="{{ $icon }}" type="{{ $iconType }}"></x-ui-icon>
		</span>
	</{{ $tag }}>
</div>