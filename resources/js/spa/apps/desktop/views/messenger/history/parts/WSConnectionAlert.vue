<template>
	<div class="flex gap-2 items-center px-4 leading-none border-b border-b-bord-pr pb-4">
		<div class="shrink-0 size-medium-avatar inline-flex-center bg-red-900 rounded-full">
			<span class="size-icon-small text-white">
				<SvgIcon name="signal-03"></SvgIcon>
			</span>
		</div>
		<div class="flex-1">
			<h6 class="text-par-s font-semibold mb-1 text-lab-pr2">
				{{  $t('chat.alerts.ws_connection.title') }}
			</h6>
			<p class="text-par-s text text-lab-sc leading-tight">
				{{  $t('chat.alerts.ws_connection.desc') }}
			</p>
		</div>
	</div>
</template>