import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  plugins: ['./server/plugins/cors.ts'],
  routeRules: {
    '/api/**': { cors: true },
  },
  preset: 'node-server',
  port: 3000,
  host: '127.0.0.1',
})
