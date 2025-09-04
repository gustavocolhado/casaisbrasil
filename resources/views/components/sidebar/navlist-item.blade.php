@props([
	'href' => '#',
	'iconName' => 'x',
	'iconType' => 'line',
	'text' => 'Navlist Item',
	'current' => false,
	'tag' => 'a',
	'muted' => false
])

<{{ $tag }} href="{{ $href }}" class="flex cursor-pointer items-center {{ $muted ? 'opacity-50' : '' }} {{ $current ? 'sidenav-active' : 'sidenav-inactive' }}" {{ $attributes }}>
	<span class="size-[20px] shrink-0">
		<x-ui-icon type="{{ $iconType }}" name="{{ $iconName }}"></x-ui-icon>
	</span>
	<span class="text-par-m ml-3 whitespace-nowrap">
		{{ $text }}
	</span>
</{{ $tag }}>