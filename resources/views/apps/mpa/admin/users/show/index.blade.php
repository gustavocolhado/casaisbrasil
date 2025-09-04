@extends('adminLayout::index')

@section('pageContent')
<div x-data="alpineComponent">
	<div class="mb-8">
        <x-page-title titleText=" {{ __('admin/users.show_title') }}"></x-page-title>
    </div>
	<x-sided-content>
		<x-slot:sideContent>
			<x-entity.previews.user :userData="$userData"></x-entity.previews.user>
		</x-slot:sideContent>
		<div class="mb-4">
			<x-entity.header 
				avatarUrl="{{ $userData->avatar_url }}" 
				name="{{ $userData->name }}"
			caption="{{ $userData->caption }}">

				<x-slot:controlOptions>
					<x-ui.dropdown.dropdown>
						<x-slot:dropdownButton>
							<span class="opacity-50 hover:opacity-100">
								<x-ui.buttons.icon></x-ui.buttons.icon>
							</span>
						</x-slot:dropdownButton>

						<x-ui.dropdown.item tag="a" href="{{ $userData->profile_url }}" target="_blank" itemText="{{ __('admin/dd.user.view_profile') }}">
							<x-slot:itemIcon>
								<x-ui-icon type="line" name="arrow-up-right"></x-ui-icon>
							</x-slot:itemIcon>
						</x-ui.dropdown.item>
						<x-ui.dropdown.item tag="a" :danger="true" x-on:click="deleteUser" itemText="{{ __('admin/dd.user.delete') }}">
							<x-slot:itemIcon>
								<x-ui-icon type="line" name="trash-04"></x-ui-icon>
							</x-slot:itemIcon>
						</x-ui.dropdown.item>
					</x-ui.dropdown.dropdown>
				</x-slot:controlOptions>
			</x-entity.header>
		</div>
		<div class="mb-4">
			<x-entity.title title="{{ __('admin/users.about_user') }}" caption="{{ __('table.labels.last_seen') }}: {{ $userData->getLastActive()->getFormatted() }}"></x-entity.title>
		</div>
		<div class="mb-6">
			<x-counter.counter>
				<x-counter.counter-item counterValue="{{ $userData->followers_count }}" captionText="{{ __('labels.followers') }}"></x-counter.counter-item>
				<x-counter.counter-item counterValue="{{ $userData->following_count }}" captionText="{{ __('labels.following') }}"></x-counter.counter-item>
				<x-counter.counter-item counterValue="{{ $userData->publications_count }}" captionText="{{ __('labels.posts') }}"></x-counter.counter-item>
			</x-counter.counter>
		</div>
		<div class="mb-6">
			<x-line-table.table>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.full_name') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->name }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.username') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ '@' . $userData->username }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.email') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->email }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.country') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->country_name }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.city') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ empty($userData->city) ? __('labels.not_set') : $userData->city }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.joined_at') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->getCreatedAt()->getFormatted() }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.last_seen') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->getLastActive()->getFormatted() }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						IP address
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->ip_address }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.verification') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->verified ? '✅' : '❌' }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.website') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ empty($userData->website) ? __('labels.not_set') : $userData->website }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.phone') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ empty($userData->phone) ? __('labels.not_set') : $userData->phone }}
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.gender') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						@if($userData->gender == 'male')
							{{ __('labels.male') }}
						@elseif($userData->gender == 'female')
							{{ __('labels.female') }}
						@else
							{{ __('labels.not_set') }}
						@endif
					</x-slot:labelValue>
				</x-line-table.row>
				<x-line-table.row>
					<x-slot:labelText>
						{{ __('table.labels.birthday') }}
					</x-slot:labelText>
					<x-slot:labelValue>
						{{ $userData->birth_date }}
					</x-slot:labelValue>
				</x-line-table.row>
			</x-line-table.table>
		</div>
		<div class="mb-4">
			<x-entity.title title="{{ __('labels.additional_info') }}"></x-entity.title>
		</div>

		<x-striped-table.table>
			<x-striped-table.row>
				<x-slot:labelText>
					#ID
				</x-slot:labelText>
				<x-slot:labelValue>
					#{{ $userData->id }}
				</x-slot:labelValue>
			</x-striped-table.row>
			<x-striped-table.row>
				<x-slot:labelText>
					{{ __('table.labels.wallet_balance') }}
				</x-slot:labelText>
				<x-slot:labelValue>
					{{ $userData->wallet->balance->getFormattedAmount() }}
				</x-slot:labelValue>
			</x-striped-table.row>
		</x-striped-table.table>
	</x-sided-content>
</div>
<script>
	window.addEventListener('alpine:init', () => {
		Alpine.data('alpineComponent', () => {
			return {
				deleteUser: () => {
					Alpine.store('confirmModal').open({
						title: "{{ __('admin/prompt.delete_user.title') }}",
						desc: "{{ __('admin/prompt.delete_user.description') }}",
						formAction: "{{ route('admin.users.destroy', $userData->id) }}"
					});
				}
			}
		});
	});
</script>
@endsection