@props([
	'controls' => null,
	'logo' => "",
	'name' => 'Header',
	'link' => '#'
])

<header class="mb-6 fixed top-0 right-0 left-sidebar-width bg-bg-pr/80 backdrop-blur-md z-50">
    <div class="flex items-center py-3 h-16">
        <a href="{{ $link }}" class="flex items-center gap-2 w-72 pl-8">
            <img class="h-5" src="{{ $logo }}" alt="Image">
            <span class="font-bold text-lab-pr">
                {{ $name }}
            </span>
        </a>
		@if(isset($controls))
			<div class="pr-8 ml-auto">
				<div class="flex items-center gap-6 leading-none">
					{{ $controls }}
				</div>
			</div>
		@endif
    </div>
</header>