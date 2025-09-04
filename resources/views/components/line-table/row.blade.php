<div class="flex justify-between py-2 border-b border-bord-pr border-dashed">
    <span class="text-cap-l text-lab-sc">
        {{ (isset($labelText) == true) ? $labelText : '' }}
    </span>
    <span class="text-cap-l text-lab-pr ml-12 text-right">
        {{ (isset($labelValue) == true) ? $labelValue : '' }}
    </span>
</div>