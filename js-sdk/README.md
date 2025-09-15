# Mini Debug SDK

一个轻量级的网络请求拦截和调试工具 SDK。

## 功能特性

- 🔍 网络请求记录和监控
- 🛡️ 请求拦截和参数修改
- 📝 响应拦截和数据篡改
- 🎨 简洁的调试面板界面
- 📱 拖拽和位置记忆
- 💾 本地存储管理

## 安装

```bash
npm install mini-debug-sdk
```

## 使用方法

### ES6 模块

```javascript
import ApolloSecurityTester from 'mini-debug-sdk'

// 初始化
const debugSDK = new ApolloSecurityTester({
  autoStart: true,
  position: 'bottom-right'
})

debugSDK.init()
```

### 全局变量

```html
<script src="dist/index.js"></script>
<script>
  // 使用全局 API
  apolloSecurityTester.init({
    autoStart: true
  })
</script>
```

### 快速开始

```javascript
import { init, start, stop } from 'mini-debug-sdk'

// 初始化并启动
init({ autoStart: true })

// 手动控制
start()  // 显示调试面板
stop()   // 隐藏调试面板
```

## API 文档

### ApolloSecurityTester

主要的 SDK 类。

#### 构造函数

```javascript
new ApolloSecurityTester(options)
```

**参数：**
- `options.autoStart` (boolean): 是否自动启动，默认 `true`
- `options.position` (string): 面板位置，默认 `'bottom-right'`
- `options.theme` (string): 主题，默认 `'auto'`

#### 方法

##### init()

初始化 SDK。

```javascript
debugSDK.init()
```

##### start()

启动调试面板。

```javascript
debugSDK.start()
```

##### stop()

停止调试面板。

```javascript
debugSDK.stop()
```

##### destroy()

销毁 SDK 实例。

```javascript
debugSDK.destroy()
```

##### getNetworkLogs()

获取网络日志。

```javascript
const logs = debugSDK.getNetworkLogs()
```

##### clearNetworkLogs()

清空网络日志。

```javascript
debugSDK.clearNetworkLogs()
```

##### getInterceptRules()

获取拦截规则。

```javascript
const rules = debugSDK.getInterceptRules()
```

##### setInterceptRules(rules)

设置拦截规则。

```javascript
debugSDK.setInterceptRules({
  request: new Map(),
  response: new Map()
})
```

### 全局 API

#### init(options)

初始化全局实例。

```javascript
import { init } from 'mini-debug-sdk'
init({ autoStart: true })
```

#### start()

启动调试面板。

```javascript
import { start } from 'mini-debug-sdk'
start()
```

#### stop()

停止调试面板。

```javascript
import { stop } from 'mini-debug-sdk'
stop()
```

#### getInstance()

获取全局实例。

```javascript
import { getInstance } from 'mini-debug-sdk'
const instance = getInstance()
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 许可证

MIT
