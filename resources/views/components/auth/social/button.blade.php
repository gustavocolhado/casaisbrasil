<a {{ $attributes }} class="rounded-md border border-edge-tr block leading-none">
    <div class="flex relative h-12 md:h-14 items-center">
        @if(isset($iconSlot))
            <div class="absolute left-4 size-4 md:size-6 top-4 block overflow-hidden">
                {{ $iconSlot }}
            </div>
        @endif

        <span class="text-center block w-full text-lab-pr2 text-par-s md:text-par-n font-medium">{{ $slot }}</span>
    </div>
</a>