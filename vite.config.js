import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Copy .htaccess to dist after build
    {
      name: 'copy-htaccess',
      closeBundle() {
        const src = resolve(__dirname, 'public/.htaccess')
        const dest = resolve(__dirname, 'dist/.htaccess')
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
          console.log('✓ .htaccess copied to dist')
        }
      }
    }
  ],
  server: { port: 3000 },
  build: {
    // Ensure dotfiles in public are copied
    copyPublicDir: true,
  }
})
