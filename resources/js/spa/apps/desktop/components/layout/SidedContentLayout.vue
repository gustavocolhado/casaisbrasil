<template>
	<div class="w-sided-content">
		<div class="flex gap-4">
			<div class="min-w-content w-content">
				<slot name="content"></slot>
			</div>
			<div class="flex-1 max-w-content-side">
				<div class="block h-min sticky top-4">
					<div class="overflow-hidden">
						<slot name="sidebar"></slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>