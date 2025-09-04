@props([
	'href' => '#',
	'name' => '',
	'caption' => '',
	'tag' => 'a',
	'footer' => '',
])

<div class="rounded-xl border border-bord-pr w-full relative">
	<div class="p-4 leading-none">
		<h2 class="text-par-m font-bold mb-1 text-lab-pr">
			{{ $name }}
		</h2>
		<p class="text-lab-sc text-cap-l">
			{{ $caption }}
		</p>
	</div>

	@if($footer)
		<x-div></x-div>
		{{ $footer }}
	@endif
</div>