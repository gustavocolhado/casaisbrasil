@props([
	'imageUrl' => null
])

<div class="overflow-hidden rounded-lg h-52 border border-bord-pr">
	<img class="size-full object-center object-cover" src="{{ $imageUrl }}" alt="Image">
</div>