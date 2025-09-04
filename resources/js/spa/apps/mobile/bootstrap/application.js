import '@M/bootstrap/initialization/index.js';

import { createApp } from 'vue';

import ColibriPlusMobile from '@M/bootstrap/boot/ColibriPlusMobile.vue';
import Router from '@M/router/index.js';

import globalHelpers from '@M/core/global/global.helpers.js';

const Application = createApp(ColibriPlusMobile);

Application.use(Router);
Application.use(globalHelpers);

Application.mount("#colibriplus-mobile-app");