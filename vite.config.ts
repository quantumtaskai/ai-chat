import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true
  }
})