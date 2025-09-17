import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'public',
  server: {
    port: 3000,
    open: true
  }
})