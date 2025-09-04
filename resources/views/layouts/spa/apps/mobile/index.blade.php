<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <title>{{ config('app.name') }}</title>

        @include('layouts.parts.meta')
        @include('layouts.parts.favicons')

        @vite([
            'resources/js/spa/apps/mobile/bootstrap/application.js',
            'resources/fonts/sf-pro/stylesheet.css'
        ])

		@vite('resources/css/spa/apps/mobile/main.css')
    </head>
    <body>
        <x-device-switcher.mobile></x-device-switcher.mobile>

        @yield('pageContent')

        @include('layouts.spa.apps.parts.embeds')
    </body>
</html>
