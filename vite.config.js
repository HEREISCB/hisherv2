import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    server: {
        allowedHosts: [
            'localhost',
            '.trycloudflare.com'
        ]
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'heyitsmecb.html')
            }
        }
    }
})
