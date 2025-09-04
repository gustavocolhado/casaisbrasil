@props([
    'defaultClasses' => [
        'absolute',
        'transition-all',
        'ease-in-out',
        'min-w-72',
        'rounded-md',
        'bg-bg-pr/80',
        'backdrop-blur-xs',
        'z-40',
        'shadow-lg',
        'min-h-10'
    ],
    'classes' => [
        'origin-bottom-left',
        'right-0',
        'top-full',
    ]
])

<div x-data="{ open: false }" class="relative" x-cloak>
    <span @click="open = !open" class="inline-block">
        {{ $dropdownButton }}
    </span>

    <div x-show="open" @click.away="open = false" class="{{ implode(' ', array_merge($defaultClasses, $classes)) }}">
        {{ $slot }}
    </div>
</div>