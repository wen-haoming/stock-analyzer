# AI 股票分析工具 - Electron 桌面应用

## 运行方式

### 开发模式
```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 构建 Electron 主进程
npm run build:electron

# 4. 运行 Electron (会自动启动后端)
npm run electron:start
```

### 生产打包
```bash
npm run electron:package
```

## 项目结构

```
stock-analyzer/
├── electron/           # Electron 主进程
│   ├── main.ts        # 主进程 + Nitro 服务器启动
│   └── preload.ts     # 预加载脚本
├── server/            # Nitro 后端 (内嵌在 Electron 中)
│   ├── routes/       # API 路由
│   ├── services/     # 服务 (数据抓取 + AI分析)
│   └── plugins/      # Nitro 插件
├── src/              # React 前端
│   ├── components/  # React 组件
│   ├── services/    # API 调用
│   └── App.tsx     # 主应用
└── package.json
```

## 启动流程

```
1. npm run electron:start
       ↓
2. Electron 主进程启动
       ↓
3. Nitro 服务器在 127.0.0.1:3000 启动
       ↓
4. React 前端加载 (dist/index.html)
       ↓
5. 前端通过 fetch('http://127.0.0.1:3000/api/...') 调用后端
```

## 技术架构

- **桌面框架**: Electron 41
- **前端**: React 19 + Ant Design 6 + Vite 8
- **后端**: Nitro (内嵌在 Electron 进程)
- **AI**: MiniMax 2.7
- **K线图**: lightweight-charts

## 注意事项

1. 后端和前端都在同一个 Electron 进程中运行
2. 前端通过 `http://127.0.0.1:3000` 调用后端 API
3. 无需单独启动后端服务器
