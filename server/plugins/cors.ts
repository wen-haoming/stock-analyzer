// Nitro 服务器配置 - 供 Electron 内嵌使用

export default defineNitroPlugin((nitro) => {
  // 设置 CORS 允许 Electron 访问
  nitro.hooks.hook('request', (event) => {
    event.node.res.setHeader('Access-Control-Allow-Origin', '*')
    event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  })
})
