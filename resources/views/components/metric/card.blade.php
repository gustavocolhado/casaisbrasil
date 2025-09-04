@props(['title', 'value', 'iconName' => 'user', 'iconType' => 'line'])

<div class="bg-input-pr rounded-lg p-4 relative">
	<div class="flex items-center gap-2 size-icon-small text-lab-sc absolute top-5 right-4">
		<x-ui-icon :name="$iconName" :type="$iconType"/>
	</div>
	<span class="block text-5xl tracking-tighter leading-none lowercase font-light font-outfit text-lab-pr2 mb-1">{{ $value }}</span>
	<span class="text-par-s block text-lab-sc opacity-70">{{ $title }}</span>
</div>