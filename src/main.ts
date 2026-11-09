import { createApp } from 'vue'
import '@fontsource-variable/noto-sans-jp'
import '@fontsource-variable/noto-serif-jp'
import './style.css'
import App from './App.vue'
import { router } from './router'
createApp(App).use(router).mount('#app')
