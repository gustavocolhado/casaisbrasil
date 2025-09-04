@props([
	'avatarUrl' => asset(config('user.avatar'))
])

<div class="size-small-avatar relative">
	<div class="size-full bg-bg-pr border border-bord-pr overflow-hidden rounded-full">
		<img src="{{ $avatarUrl }}" alt="Avatar">
	</div>
</div>