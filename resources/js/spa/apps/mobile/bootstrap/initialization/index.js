/*
|------------------------------------------------------------------
| Mobile Bootstrap Initialization
|------------------------------------------------------------------
| This file is part of the pre initialization of the VueJS application.
| It prepares the framework before the actual application starts.
|
| @Author: (Mansur Terla)
*/

import '@/kernel/helpers/helpers.js';
import '@/kernel/helpers/javascript/index.js';

import axios from 'axios';

import '@/kernel/helpers/embeds/index.js';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
