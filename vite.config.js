import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PWA PROYECTO ESCUELA',
        short_name: 'PPE',
        description: 'Aplicación web progresiva para el proyecto de la uni',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#034729',
        icons: [
        {
           src: 'icons/images/icono1.jpg',
           sizes: '128x128',
            type: 'image/jpg'
        },
        {
            src: 'icons/images/icono2.jpg',
            sizes: '512x512',
            type: 'image/jpg'
        }
      ],
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
