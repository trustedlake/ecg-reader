import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Serve api/drive-upload/upload.ts localmente sem precisar do Vercel CLI.
// Módulo temporário — remover junto com api/drive-upload quando ele sair de uso.
function driveUploadDevMiddleware(): Plugin {
  return {
    name: 'drive-upload-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/drive-upload/upload', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/drive-upload/upload.ts')
        await handler(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const rootDir = import.meta.dirname
  const env = loadEnv(mode, rootDir, '')
  Object.assign(process.env, env)

  return {
    root: rootDir,
    plugins: [react(), driveUploadDevMiddleware()],
    server: {
      port: 47535,
    },
    resolve: {
      alias: [
        { find: /^react-native$/, replacement: 'react-native-web' },
        { find: /^react-native-svg$/, replacement: 'react-native-svg/src/index.ts' },
      ],
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.jsx'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    optimizeDeps: {
      exclude: ['react-native-svg'],
    },
  }
})
