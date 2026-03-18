// Electron 主进程 - 启动内嵌的后端服务

import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { fileURLToPath } from 'url'

// 获取当前目录
const __dirname = fileURLToPath(new URL('.', import.meta.url))

let mainWindow: BrowserWindow | null = null
let nitroProcess: ChildProcess | null = null

// 启动 Nitro 后端服务
function startNitroServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('[Electron] 正在启动后端服务...')
    
    // 找到后端服务路径
    const serverPath = join(__dirname, '../.output/server/index.mjs')
    
    // 启动 Nitro 服务器
    nitroProcess = spawn('node', [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3000',
        HOST: '127.0.0.1',
      },
      stdio: 'pipe',
    })
    
    nitroProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log('[Nitro]', output)
      
      // 检测服务启动成功
      if (output.includes('Listening') || output.includes('3000')) {
        console.log('[Nitro] 后端服务已启动: http://127.0.0.1:3000')
        resolve()
      }
    })
    
    nitroProcess.stderr?.on('data', (data) => {
      console.error('[Nitro Error]', data.toString())
    })
    
    nitroProcess.on('error', (error) => {
      console.error('[Nitro] 启动失败:', error)
      reject(error)
    })
    
    // 超时检测
    setTimeout(() => {
      console.log('[Nitro] 等待服务启动...')
    }, 3000)
  })
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'AI 股票分析',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // macOS 原生风格
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
  })

  // 加载前端页面
  // 生产模式：加载构建后的静态文件
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 点击链接在浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  console.log('[Electron] 主窗口已创建')
}

// IPC 通信 - 获取 API 地址
ipcMain.handle('get-api-url', () => {
  return 'http://127.0.0.1:3000'
})

// IPC 通信 - 获取 Nitro 状态
ipcMain.handle('get-server-status', () => {
  return {
    running: nitroProcess !== null,
    url: 'http://127.0.0.1:3000'
  }
})

// 应用就绪
app.whenReady().then(async () => {
  console.log('[App] 应用启动中...')
  
  // 启动 Nitro 后端
  try {
    await startNitroServer()
  } catch (error) {
    console.error('[App] 后端启动失败:', error)
    // 继续启动，即使后端失败
  }
  
  // 创建窗口
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  // 关闭 Nitro 服务器
  if (nitroProcess) {
    console.log('[Electron] 关闭后端服务...')
    nitroProcess.kill()
    nitroProcess = null
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 退出前清理
app.on('before-quit', () => {
  if (nitroProcess) {
    nitroProcess.kill()
  }
})
