/**
 * Mini Debug SDK - 核心模块
 * 提供网络请求拦截和调试功能
 */

import { NetworkLogger } from '../interceptors/network-logger.js'
import { RequestInterceptor } from '../interceptors/request-interceptor.js'
import { ResponseInterceptor } from '../interceptors/response-interceptor.js'
import { DebugPanel } from '../ui/debug-panel.js'
import { StorageManager } from '../utils/storage.js'

class ApolloSecurityTester {
  constructor(options = {}) {
    this.options = {
      autoStart: true,
      position: 'bottom-right',
      theme: 'auto',
      ...options
    }

    this.networkLogger = new NetworkLogger()
    this.requestInterceptor = new RequestInterceptor()
    this.responseInterceptor = new ResponseInterceptor()
    this.debugPanel = new DebugPanel()
    this.storage = new StorageManager()

    this.isInitialized = false
    this.isActive = false
  }

  /**
   * 初始化 SDK
   */
  init() {
    if (this.isInitialized) {
      console.warn('ApolloSecurityTester already initialized')
      return this
    }

    try {
      // 初始化网络拦截器
      this.networkLogger.init(this.storage)
      this.requestInterceptor.init()
      this.responseInterceptor.init()

      // 初始化调试面板
      this.debugPanel.init({
        networkLogger: this.networkLogger,
        requestInterceptor: this.requestInterceptor,
        responseInterceptor: this.responseInterceptor,
        storage: this.storage,
        ...this.options
      })

      // 设置编辑器回调
      this.networkLogger.setEditors(
        this.debugPanel.openRealtimeEditor.bind(this.debugPanel),
        this.debugPanel.openResponseLiveEditor.bind(this.debugPanel)
      )

      this.isInitialized = true

      if (this.options.autoStart) {
        this.start()
      }

      // MiniDebugSDK initialized successfully
    } catch (error) {
      // Failed to initialize MiniDebugSDK
      throw error
    }

    return this
  }

  /**
   * 启动调试面板
   */
  start() {
    if (!this.isInitialized) {
      throw new Error('SDK not initialized. Call init() first.')
    }

    if (this.isActive) {
      console.warn('ApolloSecurityTester already active')
      return this
    }

    // 只启动功能，面板默认关闭，需要用户手动点击切换按钮
    this.isActive = true

    return this
  }

  /**
   * 停止调试面板
   */
  stop() {
    if (!this.isActive) {
      return this
    }

    this.debugPanel.hide()
    this.isActive = false

    return this
  }

  /**
   * 销毁 SDK
   */
  destroy() {
    this.stop()

    this.networkLogger.destroy()
    this.requestInterceptor.destroy()
    this.responseInterceptor.destroy()
    this.debugPanel.destroy()

    this.isInitialized = false
    this.isActive = false

    return this
  }

  /**
   * 获取网络日志
   */
  getNetworkLogs() {
    return this.networkLogger.getLogs()
  }

  /**
   * 清空网络日志
   */
  clearNetworkLogs() {
    this.networkLogger.clearLogs()
    return this
  }

  /**
   * 获取拦截规则
   */
  getInterceptRules() {
    return {
      request: this.requestInterceptor.getRules(),
      response: this.responseInterceptor.getRules()
    }
  }

  /**
   * 设置拦截规则
   */
  setInterceptRules(rules) {
    if (rules.request) {
      this.requestInterceptor.setRules(rules.request)
    }
    if (rules.response) {
      this.responseInterceptor.setRules(rules.response)
    }
    return this
  }
}

// 全局实例
let globalInstance = null

/**
 * 获取全局实例
 */
export function getInstance() {
  if (!globalInstance) {
    globalInstance = new ApolloSecurityTester()
  }
  return globalInstance
}

/**
 * 初始化全局实例
 */
export function init(options) {
  return getInstance().init(options)
}

/**
 * 启动调试面板
 */
export function start() {
  return getInstance().start()
}

/**
 * 停止调试面板
 */
export function stop() {
  return getInstance().stop()
}

export { ApolloSecurityTester }
export default ApolloSecurityTester
