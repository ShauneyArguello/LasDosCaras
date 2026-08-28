import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { applyInitialTheme } from './stores/theme'
import { useNetworkStore } from './stores/network'

applyInitialTheme()
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useNetworkStore(pinia).init()

app.mount('#app')
