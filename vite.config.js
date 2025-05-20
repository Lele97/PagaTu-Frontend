// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8888,
        open: true,
        host: true,
    },
    resolve: {
        alias: {
            '~': '/app',
        },
    },
})