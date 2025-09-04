@props([
	'active' => false,
	'textLabel' => '',
	'link' => ''
])

<a {{ $attributes }} class="bg-badge-pr rounded-full px-4 pt-4 pb-4.5 leading-zero cursor-pointer {{ $active ? 'bg-lab-pr2 text-bg-pr' : ' text-lab-pr2'}}">
	<span class="text-cap-l">
		{{ $textLabel }}
	</span>
</a>