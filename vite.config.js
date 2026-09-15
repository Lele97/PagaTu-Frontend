import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                manifest: false,
                devOptions: { enabled: false },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,json}'],
                    navigateFallbackDenylist: [/^\/api/],
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                }
            })
        ],
        server: {
            host: env.VITE_HOST,
            port: parseInt(env.VITE_PORT || '8888', 10),
            open: true,
            proxy: {
                '/api': {
                    target: env.VITE_GATEWAY_SERVER_URL || 'http://localhost:8080',
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
                    },
                },
            },
        },
        preview: {
            host: '127.0.0.1',  // ← AGGIUNGI
            //host: '0.0.0.0',
            port: 4173,
        },
    };
});
