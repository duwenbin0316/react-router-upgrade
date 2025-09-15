/**
 * 响应拦截器
 * 负责拦截和修改网络响应
 */

export class ResponseInterceptor {
  constructor() {
    this.rules = new Map()
    this.originalFetch = null
    this.originalXHR = null
    this.isInitialized = false
  }

  /**
   * 初始化响应拦截器
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
   * 拦截 fetch 响应
   */
  interceptFetch() {
    if (!window.fetch) {
      return
    }

    this.originalFetch = window.fetch
    const self = this

    window.fetch = function(url, init = {}) {
      return self.originalFetch.call(this, url, init).then(response => {
        const rule = self.rules.get(url)
        
        if (rule && rule.responseLive) {
          // 实时拦截模式
          return self.handleRealtimeIntercept(url, response, init)
        } else if (rule && rule.responseTamper) {
          // 自动拦截模式
          return self.handleAutoIntercept(url, response, rule)
        } else {
          // 正常响应
          return response
        }
      })
    }
  }

  /**
   * 拦截 XMLHttpRequest 响应
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

      xhr.open = function(method, url) {
        _method = method || 'GET'
        _url = url || ''
        return originalOpen.apply(this, arguments)
      }

      xhr.send = function(body) {
        // 添加响应拦截逻辑
        const originalOnReadyStateChange = xhr.onreadystatechange
        
        xhr.addEventListener('readystatechange', function() {
          if (xhr.readyState === 4) {
            const rule = self.rules.get(_url)
            
            if (rule && rule.responseLive) {
              // 实时拦截模式
              self.handleXHRRealtimeIntercept(xhr, _url, _method)
            } else if (rule && rule.responseTamper) {
              // 自动拦截模式
              self.handleXHRAutoIntercept(xhr, _url, rule)
            }
          }
          
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(this)
          }
        })

        return originalSend.apply(this, arguments)
      }

      return xhr
    }
  }

  /**
   * 处理实时拦截
   */
  handleRealtimeIntercept(url, response, init) {
    // 这里需要与 UI 模块交互，显示编辑弹窗
    // 暂时返回原始响应
    return response
  }

  /**
   * 处理自动拦截
   */
  handleAutoIntercept(url, response, rule) {
    const mockResponse = new Response(
      JSON.stringify(rule.responseTamper.data || rule.responseTamper),
      {
        status: rule.responseTamper.status || 200,
        statusText: rule.responseTamper.statusText || 'OK',
        headers: {
          'Content-Type': 'application/json',
          ...rule.responseTamper.headers
        }
      }
    )
    
    return mockResponse
  }

  /**
   * 处理 XHR 实时拦截
   */
  handleXHRRealtimeIntercept(xhr, url, method) {
    // 这里需要与 UI 模块交互，显示编辑弹窗
    // 暂时保持原始响应
  }

  /**
   * 处理 XHR 自动拦截
   */
  handleXHRAutoIntercept(xhr, url, rule) {
    // 模拟响应
    Object.defineProperty(xhr, 'readyState', { value: 4, writable: false })
    Object.defineProperty(xhr, 'status', { value: rule.responseTamper.status || 200, writable: false })
    Object.defineProperty(xhr, 'statusText', { value: rule.responseTamper.statusText || 'OK', writable: false })
    Object.defineProperty(xhr, 'responseText', { 
      value: JSON.stringify(rule.responseTamper.data || rule.responseTamper), 
      writable: false 
    })
    Object.defineProperty(xhr, 'response', { 
      value: JSON.stringify(rule.responseTamper.data || rule.responseTamper), 
      writable: false 
    })

    // 触发事件
    const event = new Event('readystatechange')
    xhr.dispatchEvent(event)
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
   * 销毁响应拦截器
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
