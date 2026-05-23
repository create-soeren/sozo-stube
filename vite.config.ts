import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project-Page Deploy: https://<username>.github.io/sozo-stube/
// Base muss zur Production-URL matchen, in Dev bleibt es '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/sozo-stube/' : '/',
}))
