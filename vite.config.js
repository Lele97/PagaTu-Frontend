import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [react()],
        server: {
            host: env.VITE_HOST,
            port: parseInt(env.VITE_PORT || '8888', 10),
            open: true,
            allowedHosts: env.VITE_ALLOWED_HOSTS
                ? env.VITE_ALLOWED_HOSTS.split(',')
                : ['localhost'],
            proxy: {
                '/api': {
                    target: env.VITE_GETAWAY_SERVER_URL,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        resolve: {
            alias: {
                '~': '/app',
            },
        },
    }
})
