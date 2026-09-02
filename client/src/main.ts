import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import App from '@/App.vue';
import { router } from '@/router';
import '@/styles/main.css';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VueQueryPlugin)
  .use(Vue3Toastify, { autoClose: 2500, position: 'bottom-right' } as ToastContainerOptions)
  .mount('#app');
