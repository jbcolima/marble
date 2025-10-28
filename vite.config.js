import { defineConfig } from 'vite'

// Electron needs relative asset URLs; keep using `static/` as public assets
export default defineConfig({
	base: './',
	publicDir: 'static'
})
