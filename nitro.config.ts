import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  routeRules: {
    '/api/**': { cors: true },
  },
  preset: 'node-server',
})
