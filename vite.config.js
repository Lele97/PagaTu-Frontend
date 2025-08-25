import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ['lens-drinking-dec-note.trycloudflare.com'],
        port: 8888,
        open: true,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '~': '/app',
        },
    },
})