@props([
    'btnText' => 'Label',
    'type' => 'button',
    'width' => 'w-auto',
    'size' => 'md',
    'sizeOptions' => [
        'sm' => 'py-2.5 px-4 text-cap-l',
        'md' => 'py-3.5 px-6 text-par-s',
        'lg' => 'py-4.5 px-8 text-par-m',
    ],
    'variant' => 'default',
    'variantOptions' => [
        'default' => 'bg-fill-tr text-brand-900',
        'danger' => 'bg-fill-tr text-red-900',
        'accent' => 'bg-lab-pr2 text-bg-sc',
    ]
])


<button class="{{ $width }} {{ $sizeOptions[$size] }} block {{ $variantOptions[$variant] }} rounded-full font-medium cursor-pointer disabled:opacity-60 disabled:cursor-wait" type="{{ $type }}">
    {{ $btnText }}
</button>