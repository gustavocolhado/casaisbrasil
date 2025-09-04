<x-table.tr>
	<x-table.td variant="strong" weight="medium">
		<x-table.avatar :avatarSrc="$userData->avatar_url" :name="$userData->name" :link="route('admin.users.show', $userData->id)" />
	</x-table.td>
	<x-table.td>
		{{ $userData->email }}
	</x-table.td>
	<x-table.td variant="muted">
		{{ $userData->country_name }}
	</x-table.td>
	<x-table.td variant="muted">
		{{ $userData->ip_address }}
	</x-table.td>
	<x-table.td variant="muted">
		{{ $userData->getCreatedAt()->getFormatted() }}
	</x-table.td>
	<x-table.td variant="muted">
		{{ $userData->getLastActive()->getTimeAgo() }}
	</x-table.td>
	<x-table.td variant="muted" :numeric="true">
		{{ $userData->id }}
	</x-table.td>
</x-table.tr>