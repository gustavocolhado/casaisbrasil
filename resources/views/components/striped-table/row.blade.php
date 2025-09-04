<div class="flex justify-between py-2 px-4 odd:bg-fill-qt">
    <span class="text-cap-l text-lab-sc">
        {{ (isset($labelText) == true) ? $labelText : '' }}
    </span>
    <span class="text-cap-l text-lab-pr">
        {{ (isset($labelValue) == true) ? $labelValue : '' }}
    </span>
</div>