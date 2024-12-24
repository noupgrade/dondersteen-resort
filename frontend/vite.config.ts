import path from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react-swc'

import { createTranslationsMiddleware } from './vite.tools'

// Vite configuration
export default defineConfig({
    plugins: [
        react(),
        svgr(),
        sentryVitePlugin({
            org: 'innovation-root-sl',
            project: 'javascript-react',
        }),
        createTranslationsMiddleware(),
    ],
    build: {
        sourcemap: true,
    },
    server: {
        headers: {
            'Document-Policy': 'js-profiling',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
