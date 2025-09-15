/**
 * 请求拦截器
 * 负责拦截和修改网络请求
 */

export class RequestInterceptor {
  constructor() {
    this.rules = new Map()
    this.originalFetch = null
    this.originalXHR = null
    this.isInitialized = false
  }

  /**
   * 初始化请求拦截器
   */
  init() {
    if (this.isInitialized) {
      return
    }

    this.interceptFetch()
    this.interceptXHR()
    this.isInitialized = true
  }

  /**
   * 拦截 fetch 请求
   */
  interceptFetch() {
    if (!window.fetch) {
      return
    }

    this.originalFetch = window.fetch
    const self = this

    window.fetch = function(url, init = {}) {
      const rule = self.rules.get(url)
      
      if (rule && rule.requestLive) {
        // 实时拦截模式
        return self.handleRealtimeIntercept(url, init, 'fetch')
      } else if (rule && rule.mode === 'auto') {
        // 自动拦截模式
        return self.handleAutoIntercept(url, init, 'fetch')
      } else {
        // 正常请求
        return self.originalFetch.call(this, url, init)
      }
    }
  }

  /**
   * 拦截 XMLHttpRequest
   */
  interceptXHR() {
    if (!window.XMLHttpRequest) {
      return
    }

    this.originalXHR = window.XMLHttpRequest
    const self = this

    window.XMLHttpRequest = function() {
      const xhr = new self.originalXHR()
      const originalOpen = xhr.open
      const originalSend = xhr.send

      let _url = ''
      let _method = 'GET'
      let _start = 0
      let _body = undefined

      xhr.open = function(method, url) {
        _method = method || 'GET'
        _url = url || ''
        return originalOpen.apply(this, arguments)
      }

      xhr.send = function(body) {
        _start = Date.now()
        _body = body

        const rule = self.rules.get(_url)
        
        if (rule && rule.requestLive) {
          // 实时拦截模式
          self.handleXHRRealtimeIntercept(xhr, _url, _method, _body, _start, originalSend)
          return
        } else if (rule && rule.mode === 'auto') {
          // 自动拦截模式
          self.handleXHRAutoIntercept(xhr, _url, _method, _body, _start, originalSend, rule)
          return
        } else {
          // 正常请求
          return originalSend.apply(this, arguments)
        }
      }

      return xhr
    }
  }

  /**
   * 处理实时拦截
   */
  handleRealtimeIntercept(url, init, type) {
    // 这里需要与 UI 模块交互，显示编辑弹窗
    // 暂时返回原始请求
    return this.originalFetch.call(this, url, init)
  }

  /**
   * 处理自动拦截
   */
  handleAutoIntercept(url, init, type) {
    const rule = this.rules.get(url)
    
    if (rule.requestTamper) {
      // 应用请求参数篡改
      if (rule.requestTamper.headers) {
        Object.assign(init.headers || {}, rule.requestTamper.headers)
      }
      if (rule.requestTamper.body) {
        init.body = typeof rule.requestTamper.body === 'object' 
          ? JSON.stringify(rule.requestTamper.body) 
          : rule.requestTamper.body
      }
    }

    return this.originalFetch.call(this, url, init)
  }

  /**
   * 处理 XHR 实时拦截
   */
  handleXHRRealtimeIntercept(xhr, url, method, body, startTime, originalSend) {
    // 这里需要与 UI 模块交互，显示编辑弹窗
    // 暂时发送原始请求
    originalSend.call(xhr, body)
  }

  /**
   * 处理 XHR 自动拦截
   */
  handleXHRAutoIntercept(xhr, url, method, body, startTime, originalSend, rule) {
    if (rule.requestTamper) {
      // 应用请求参数篡改
      if (rule.requestTamper.headers) {
        Object.keys(rule.requestTamper.headers).forEach(key => {
          xhr.setRequestHeader(key, rule.requestTamper.headers[key])
        })
      }
      if (rule.requestTamper.body) {
        body = typeof rule.requestTamper.body === 'object' 
          ? JSON.stringify(rule.requestTamper.body) 
          : rule.requestTamper.body
      }
    }

    originalSend.call(xhr, body)
  }

  /**
   * 添加拦截规则
   */
  addRule(url, rule) {
    this.rules.set(url, rule)
  }

  /**
   * 移除拦截规则
   */
  removeRule(url) {
    this.rules.delete(url)
  }

  /**
   * 获取拦截规则
   */
  getRules() {
    return new Map(this.rules)
  }

  /**
   * 设置拦截规则
   */
  setRules(rules) {
    this.rules = new Map(rules)
  }

  /**
   * 检查是否有拦截规则
   */
  hasRule(url) {
    return this.rules.has(url)
  }

  /**
   * 销毁请求拦截器
   */
  destroy() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch
    }
    if (this.originalXHR) {
      window.XMLHttpRequest = this.originalXHR
    }
    this.rules.clear()
    this.isInitialized = false
  }
}
