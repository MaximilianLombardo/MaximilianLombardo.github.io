import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  site: 'https://www.maximilianlombardo.com',
  base: '/',
  integrations: [react()],
  vite: { plugins: [glsl()] },
})
