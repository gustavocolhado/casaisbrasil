@php
	$layoutSide = request()->get('layoutSide', 'center');
@endphp

<div class="fixed inset-0 bg-black/15 z-50 backdrop-blur-xs">
	<div class="flex py-32 {{ $layoutSide == 'left' ? 'ml-sidebar-width pl-8' : 'justify-center'}}">
		<div class="w-content shrink-0 bg-bg-pr rounded-xl overflow-hidden shadow-xs">
			{{ $slot }}
		</div>
	</div>
</div>