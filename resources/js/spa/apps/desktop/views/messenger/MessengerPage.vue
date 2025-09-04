<template>
    <div class="left-page-offset h-screen">
        <div class="ml-16">
            <RouterView v-bind:key="$route.params.chat_id || 'inbox'"></RouterView>
        </div>
    </div>
</template>