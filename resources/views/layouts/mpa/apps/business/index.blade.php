<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name') }}</title>
        
        @include('layouts.parts.meta')
        @include('layouts.parts.favicons')

        @vite([
            'resources/js/business/main.js',
            'resources/fonts/sf-pro/stylesheet.css'
        ])

        @if(theme_name() == 'dark')
            <link rel="stylesheet" href="{{ asset('build/assets/business-main-dark.css') }}?v={{ $buildNumber }}">
        @else
            @vite('resources/css/business/main.css')
        @endif

        @stack('styles')
        
        @stack('scripts')

        @livewireStyles
    </head>

    <body @class(['bg-bg-pr pt-16'])>
        <x-main>
            @include('businessLayout::parts.sidebar')
    
            @include('businessLayout::parts.header')
            
            <x-container>
                <div class="app-min-vh">
                    @yield('pageContent')
                </div>
            </x-container>
    
            <x-modals.confirm.confirm></x-modals.confirm.confirm>
    
            @livewireScripts
        </x-main>
    </body>
</html>