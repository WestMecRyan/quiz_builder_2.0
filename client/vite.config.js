import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            // Proxy /git-admin requests to the Express server
            '/git-admin': {
                target: 'http://localhost:4000', // Your Express server will run on port 4000
                changeOrigin: true,
            }
        },

        proxy: {
            // Proxy /git-admin requests to the Express server
            '/api': {
                target: 'http://localhost:5000', // Your Express server will run on port 5000
                changeOrigin: true,
                secure: false
            }
        },
    });