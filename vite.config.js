import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            host: env.VITE_HOST,
            port: parseInt(env.VITE_PORT || '8888', 10),
            open: true,
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
                '~': path.resolve(__dirname, 'app'),
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom'],
        },
        build: {
            cssMinify: true,
            cssCodeSplit: true,
            chunkSizeWarningLimit: 300,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        utils: ['jsonpath'],
                    },
                },
            },
        },
        preview: {
            host: '127.0.0.1',  // ← AGGIUNGI
            port: 4173,
        },
    };
});
