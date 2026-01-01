import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Extract just the base URL (without /api/chat) for the proxy
  let targetUrl = env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'
  // Remove trailing /api/chat if present
  targetUrl = targetUrl.replace(/\/api\/chat\/?$/, '')
  // Remove trailing slash
  targetUrl = targetUrl.replace(/\/$/, '')

  console.log('Proxy target URL:', targetUrl)

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/ollama': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ollama/, ''),
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying:', req.method, req.url, '-> Target');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    }
  }
})