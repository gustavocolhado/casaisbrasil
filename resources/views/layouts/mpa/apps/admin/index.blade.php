<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name') }}</title>

        <!-- <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet"> -->
        @include('layouts.parts.meta')        
        @include('layouts.parts.favicons')

        @vite([
            'resources/js/admin/main.js',
            'resources/fonts/sf-pro/stylesheet.css'
        ])

        @if(theme_name() == 'dark')
            <link rel="stylesheet" href="{{ asset('build/assets/admin-main-dark.css') }}?v={{ $buildNumber }}">
        @else
            @vite('resources/css/admin/main.css')
        @endif

        @stack('styles')
        
        @stack('scripts')

        @livewireStyles
    </head>

    <body @class(['bg-bg-pr pt-16'])>
        <x-main>
            @include('adminLayout::parts.sidebar')
    
            @include('adminLayout::parts.header')

            <x-container>
                <x-messages.primary></x-messages.primary>
                <div class="app-min-vh">
                    @yield('pageContent')
                </div>
            </x-container>
    
            <x-modals.confirm.confirm></x-modals.confirm.confirm>
    
            @livewireScripts
        </x-main>
    </body>
</html>