# Mini Debug SDK - 架构设计

## 目录结构

```
js-sdk/
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   │   └── index.js       # 主 SDK 类
│   ├── interceptors/      # 拦截器模块
│   │   ├── network-logger.js    # 网络日志记录器
│   │   ├── request-interceptor.js  # 请求拦截器
│   │   └── response-interceptor.js # 响应拦截器
│   ├── ui/                # UI 组件
│   │   └── debug-panel.js # 调试面板
│   ├── utils/             # 工具模块
│   │   └── storage.js     # 存储管理器
│   └── index.js           # 入口文件
├── dist/                  # 构建输出
├── examples/              # 示例文件
│   └── basic.html         # 基础使用示例
├── package.json           # 包配置
├── rollup.config.js       # 构建配置
├── README.md              # 使用文档
└── ARCHITECTURE.md        # 架构文档
```

## 模块设计

### 1. 核心模块 (core/)

**ApolloSecurityTester** - 主 SDK 类
- 统一管理所有子模块
- 提供公共 API 接口
- 处理初始化和生命周期管理

### 2. 拦截器模块 (interceptors/)

**NetworkLogger** - 网络日志记录器
- 记录所有网络请求和响应
- 提供日志查询和管理功能
- 支持事件监听机制

**RequestInterceptor** - 请求拦截器
- 拦截 fetch 和 XMLHttpRequest 请求
- 支持实时和自动两种拦截模式
- 提供请求参数修改功能

**ResponseInterceptor** - 响应拦截器
- 拦截网络响应
- 支持响应数据修改
- 提供模拟响应功能

### 3. UI 组件 (ui/)

**DebugPanel** - 调试面板
- 提供用户交互界面
- 支持标签页切换
- 实现拖拽和位置记忆

### 4. 工具模块 (utils/)

**StorageManager** - 存储管理器
- 封装 localStorage 操作
- 提供统一的存储接口
- 支持数据序列化和反序列化

## 设计原则

### 1. 模块化
- 每个模块职责单一
- 模块间低耦合
- 支持独立测试和维护

### 2. 可扩展性
- 插件化架构
- 支持自定义拦截器
- 易于添加新功能

### 3. 性能优化
- 按需加载
- 内存管理
- 避免内存泄漏

### 4. 兼容性
- 支持多种模块系统
- 兼容不同浏览器
- 提供降级方案

## API 设计

### 构造函数模式
```javascript
const sdk = new ApolloSecurityTester(options)
```

### 函数式 API
```javascript
import { init, start, stop } from 'mini-debug-sdk'
```

### 全局变量
```javascript
window.apolloSecurityTester.init()
```

## 构建系统

使用 Rollup 进行模块打包：
- UMD 格式：支持全局变量和 CommonJS
- ES 模块：支持现代模块系统
- 压缩版本：生产环境使用

## 开发流程

1. **开发阶段**：使用 ES 模块进行开发
2. **测试阶段**：在 examples 目录中测试功能
3. **构建阶段**：使用 Rollup 打包成多种格式
4. **发布阶段**：发布到 npm 或 CDN

## 扩展指南

### 添加新的拦截器
1. 在 `interceptors/` 目录创建新文件
2. 实现标准的拦截器接口
3. 在核心模块中注册

### 添加新的 UI 组件
1. 在 `ui/` 目录创建新文件
2. 实现组件接口
3. 在调试面板中集成

### 添加新的工具模块
1. 在 `utils/` 目录创建新文件
2. 实现工具函数
3. 在需要的地方导入使用
