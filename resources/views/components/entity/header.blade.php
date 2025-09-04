@props([
	'avatarUrl' => '',
	'name' => '',
	'caption' => ''
])

<div class="flex items-center border border-bord-pr rounded-2xl p-4">
	<div class="shrink-0">
		<x-general.avatars.avatar-small :avatarUrl="$avatarUrl"></x-general.avatars.avatar-small>
	</div>
	<div class="flex-1 ml-2 mr-4 leading-none overflow-hidden">
		<h5 class="text-par-m text-lab-pr2 font-medium truncate">
			{{ $name }}
		</h5>
		@if($caption)
			<span class="text-cap-l text-lab-sc mt-0.5 block">
				{{ $caption }}
			</span>
		@endif
	</div>

	@if(isset($controlOptions))
		<div class="shrink-0">
			{!! $controlOptions !!}
		</div>
	@endif
</div>