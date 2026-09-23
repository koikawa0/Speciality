import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Target } from 'lucide-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/deezer-api": {
				target: "https://api.deezer.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/deezer-api/, ""),
			},
		},	
	},
})
