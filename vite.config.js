import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// Mode-specific overrides (applied on top of base .env)
const modeConfig = {
    development: {
        VITE_GATEWAY_SERVER_URL: 'http://localhost:8080',
        VITE_HOST: 'localhost',
        VITE_PORT: '8888',
    },
    test: {
        VITE_GATEWAY_SERVER_URL: 'http://localhost:8080',
        VITE_HOST: 'localhost',
        VITE_PORT: '8888',
    },
    locale: {
        VITE_GATEWAY_SERVER_URL: 'http://api.pagatu.local',
        VITE_HOST: '0.0.0.0',
        VITE_PORT: '8888',
    },
    production: {
        VITE_GATEWAY_SERVER_URL: 'https://api.pagatu.app',
        VITE_HOST: 'pagatu.app',
        VITE_PORT: '80',
    },
};

export default defineConfig(({ mode }) => {
    // Load base .env first, then apply mode-specific overrides.
    // loadEnv(mode, ...) picks up .env plus any .env.<mode> file that is
    // checked out locally, so a developer can still override without touching code.
    const env = { ...loadEnv(mode, process.cwd(), ''), ...(modeConfig[mode] || {}) };

    // Vite builds import.meta.env from the .env files AND from process.env.
    // Assigning here is what makes the mode overrides reach the client bundle;
    // without this the prod build would ship the base .env gateway URL.
    for (const [key, value] of Object.entries(modeConfig[mode] || {})) {
        process.env[key] = value;
    }

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
            host: '127.0.0.1',
            port: 4173,
        },
    };
});
