import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	return {
		plugins: [
			react(),
			{
				name: 'audd-proxy',
				configureServer(server) {
					server.middlewares.use('/audd-api/recognize', async (req, res) => {
						if (req.method !== 'POST') {
							res.statusCode = 405
							res.end('Method not allowed')
							return
						}

						const chunks = []
						for await (const chunk of req) {
							chunks.push(chunk)
						}
						const audioBuffer = Buffer.concat(chunks)

						const formData = new FormData()
						formData.append('api_token', env.AUDD_API_TOKEN)
						formData.append('file', new Blob([audioBuffer]), 'audio.webm')
						formData.append('return', 'apple_music,spotify')

						const auddResponse = await fetch('https://api.audd.io/', {
							method: 'POST',
							body: formData,
						})
						const data = await auddResponse.json()

						res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(data))
					})
				},
			},
		],
		server: {
			proxy: {
				'/deezer-api': {
					target: 'https://api.deezer.com',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/deezer-api/, ''),
				},
			},
		},
	}
})