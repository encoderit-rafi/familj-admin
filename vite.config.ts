import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: "window",  // 👈 this is the key fix
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    cssMinify: true,
    terserOptions: {
      compress: false,
      mangle: false
    }
  },
  plugins: [react(), tailwindcss(),],
  optimizeDeps: {
    exclude: [
      '@editorjs/editorjs',
      '@editorjs/header',
      '@editorjs/list'
    ]
  }
})
