@extends('businessLayout::index')

@section('pageContent')
    <x-content>
        @livewire('business.market.upsert', [
            'productData' => $productData,
            'upsertType' => 'edit'
        ])
    </x-content>
@endsection