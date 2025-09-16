/**
 * 网络日志记录器
 * 负责记录所有网络请求和响应
 */

export class NetworkLogger {
  constructor() {
    this.logs = []
    this.maxLogs = 200
    this.listeners = new Map() // 事件 -> Set<回调函数>
    this.uniqueRequests = new Map() // 存储唯一请求
    this.interceptRules = new Map() // URL -> intercept rule
  }

  /**
   * 初始化网络日志记录器
   */
  init() {
    this.interceptFetch()
    this.interceptXHR()
    // NetworkLogger initialized
  }

  /**
   * 设置编辑器回调
   */
  setEditors(openRealtimeEditor, openResponseLiveEditor) {
    this.openRealtimeEditor = openRealtimeEditor
    this.openResponseLiveEditor = openResponseLiveEditor
  }

  /**
   * 拦截 fetch 请求
   */
  interceptFetch() {
    if (!window.fetch) {
      return
    }

    const originalFetch = window.fetch
    this.originalFetch = originalFetch // 保存原始fetch供并发请求使用
    const self = this

    window.fetch = function(input, init) {
      const startTime = Date.now()
      const url = typeof input === 'string' ? input : (input && input.url) || ''
      const method = init?.method || 'GET'

      // 解析GET请求的URL参数
      let requestData = init || {}
      if (method === 'GET' && url) {
        try {
          const urlObj = new URL(url)
          requestData.search = urlObj.search // 直接使用查询字符串
        } catch (e) {
          // ignore parse error
          requestData = init || {}
        }
      }

      // 检查是否需要拦截（并发请求跳过拦截）
      const rule = self.interceptRules.get(url)
      if (rule && rule.requestLive && !window._isConcurrentRequest) {
        // 实时拦截模式
        return new Promise(function(resolve, reject) {
          const requestInfo = {
            url: url,
            method: method,
            originalRequest: init
          }

          if (self.openRealtimeEditor) {
            self.openRealtimeEditor(requestInfo, function(modifiedRequest) {
              // 用户确认发送，应用修改
              let finalInput = input
              let finalInit = init || {}
              
              if (modifiedRequest) {
                if (modifiedRequest.url) {
                  // GET 请求：使用修改后的 URL
                  finalInput = modifiedRequest.url
                  finalInit.url = new URL(modifiedRequest.url).url
                  finalInit.search = new URL(modifiedRequest.url).search
                }
                
                // 处理请求体
                if (modifiedRequest.body !== undefined) {
                  finalInit.body = typeof modifiedRequest.body === 'object' 
                    ? JSON.stringify(modifiedRequest.body) 
                    : modifiedRequest.body
                }
                
                // 处理方法
                if (modifiedRequest.method) {
                  finalInit.method = modifiedRequest.method
                }
                
                // 处理请求头
                if (modifiedRequest.headers) {
                  finalInit.headers = {
                    ...finalInit.headers,
                    ...modifiedRequest.headers
                  }
                }
              }

              // 发送修改后的请求
              originalFetch(finalInput, finalInit).then(function(response) {
                const timeMs = Date.now() - startTime
                const responseClone = response.clone()

                // 若同时开启了响应实时拦截，则在此对响应进行弹窗编辑（并发请求跳过）
                const latestRule = self.interceptRules.get(url)
                if (latestRule && latestRule.responseLive && !window._isConcurrentRequest) {
                  responseClone.json().then(function(orig){
                    if (self.openResponseLiveEditor) {
                      self.openResponseLiveEditor({ url: url, method: finalInit.method || 'GET' }, orig, function(edited){
                        const mockResponse = new Response(
                          JSON.stringify(edited),
                          { status: 200, headers: { 'Content-Type': 'application/json' } }
                        )
                        // 重新解析修改后的请求数据
                        let modifiedRequestData = requestData
                        if (finalInit.method === 'GET' && finalInput) {
                          try {
                            const urlObj = new URL(finalInput)
                            modifiedRequestData = urlObj.search
                          } catch (e) {
                            modifiedRequestData = requestData
                          }
                        } else if (finalInit.body) {
                          modifiedRequestData = finalInit.body
                        }
                        
                        self.addLog({
                          url: url,
                          method: finalInit.method || 'GET',
                          type: 'fetch',
                          status: 200,
                          timeMs: Date.now() - startTime,
                          intercepted: true,
                          interceptedType: 'both',
                          interceptedRequest: true,
                          interceptedResponse: true,
                          requestData: modifiedRequestData,
                          responseData: edited
                        })
                        resolve(mockResponse)
                      }, function() {
                        // 用户取消响应修改，使用原始响应
                        // 重新解析修改后的请求数据
                        let modifiedRequestData = requestData
                        if (finalInit.method === 'GET' && finalInput) {
                          try {
                            const urlObj = new URL(finalInput)
                            modifiedRequestData = urlObj.search
                          } catch (e) {
                            modifiedRequestData = requestData
                          }
                        } else if (finalInit.body) {
                          modifiedRequestData = finalInit.body
                        }
                        
                        self.addLog({
                          url: url,
                          method: finalInit.method || 'GET',
                          type: 'fetch',
                          status: response.status,
                          timeMs: Date.now() - startTime,
                          intercepted: true,
                          interceptedType: 'request',
                          interceptedRequest: true,
                          requestData: modifiedRequestData,
                          responseData: orig
                        })
                        resolve(response)
                      })
                    } else {
                      resolve(response)
                    }
                  }).catch(() => {
                    resolve(response)
                  })
                } else {
                  // 只有请求拦截，没有响应拦截
                  responseClone.json().then(data => {
                    self.addLog({
                      url: url,
                      method: finalInit.method || 'GET',
                      type: 'fetch',
                      status: response.status,
                      timeMs: Date.now() - startTime,
                      intercepted: true,
                      interceptedType: 'request',
                      interceptedRequest: true,
                      requestData: finalInit,
                      responseData: data
                    })
                  }).catch(() => {
                    self.addLog({
                      url: url,
                      method: finalInit.method || 'GET',
                      type: 'fetch',
                      status: response.status,
                      timeMs: Date.now() - startTime,
                      intercepted: true,
                      interceptedType: 'request',
                      interceptedRequest: true,
                      requestData: finalInit,
                      responseData: '[无法解析响应]'
                    })
                  })
                  resolve(response)
                }
              }).catch(function(error) {
                reject(error)
              })
            }, function() {
              // 用户取消请求
              reject(new Error('Request cancelled by user'))
            })
          } else {
            // 没有编辑器，直接发送原始请求
            originalFetch(input, init).then(resolve).catch(reject)
          }
        })
      } else if (rule && rule.responseLive && !window._isConcurrentRequest) {
        // 只有响应拦截，没有请求拦截（并发请求跳过）
        return originalFetch(input, init).then(response => {
          const timeMs = Date.now() - startTime
          const responseClone = response.clone()

          responseClone.json().then(function(orig){
            if (self.openResponseLiveEditor) {
              self.openResponseLiveEditor({ url: url, method: method }, orig, function(edited){
                const mockResponse = new Response(
                  JSON.stringify(edited),
                  { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
                self.addLog({
                  url: url,
                  method: method,
                  type: 'fetch',
                  status: 200,
                  timeMs: Date.now() - startTime,
                  intercepted: true,
                  interceptedType: 'response',
                  interceptedResponse: true,
                  requestData: requestData,
                  responseData: edited
                })
                return mockResponse
              }, function() {
                // 用户取消响应修改，使用原始响应
                self.addLog({
                  url: url,
                  method: method,
                  type: 'fetch',
                  status: response.status,
                  timeMs: Date.now() - startTime,
                  requestData: requestData,
                  responseData: orig
                })
                return response
              })
            } else {
              return response
            }
          }).catch(() => {
            return response
          })
        })
      } else {
        // 没有拦截，正常记录
        return originalFetch(input, init).then(response => {
          const timeMs = Date.now() - startTime
          const responseClone = response.clone()

          // 记录请求日志
          const log = {
            url,
            method,
            type: 'fetch',
            status: response.status,
            timeMs,
            requestData: requestData, // 使用之前解析的requestData
            responseData: null
          }

          // 尝试解析响应数据
          responseClone.json().then(data => {
            log.responseData = data
            self.addLog(log)
          }).catch(() => {
            // 如果解析失败，记录原始响应
            responseClone.text().then(text => {
              log.responseData = text
              self.addLog(log)
            }).catch(() => {
              log.responseData = '[无法解析响应]'
              self.addLog(log)
            })
          })

          return response
        }).catch(error => {
          const timeMs = Date.now() - startTime
          const log = {
            url,
            method,
            type: 'fetch',
            status: 0,
            timeMs,
            requestData: init || {},
            responseData: error.message
          }
          self.addLog(log)
          throw error
        })
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

    const originalXHR = window.XMLHttpRequest
    const self = this

    window.XMLHttpRequest = function() {
      const xhr = new originalXHR()
      let _method = 'GET'
      let _url = ''
      let _body = null
      let _start = 0
      let _rule = null

      const origOpen = xhr.open
      xhr.open = function (method, url) {
        _method = method || 'GET'
        _url = url || ''
        _rule = self.interceptRules.get(_url)

        return origOpen.apply(xhr, arguments)
      }
      
      // 保存原始URL，用于日志记录和唯一请求识别
      let _originalUrl = ''

      const origSend = xhr.send
      xhr.send = function (body) {
        _start = Date.now()
        _body = body
        
        // 保存原始URL（第一次调用时）
        if (!_originalUrl) {
          _originalUrl = _url
        }
        
        // 解析GET请求的URL参数
        let requestData = _body
        if (_method === 'GET' && _originalUrl) {
          try {
            const urlObj = new URL(_originalUrl)
            requestData = urlObj.search // 直接使用查询字符串
            // parsed XHR GET params
          } catch (e) {
            // ignore parse error
            requestData = _body
          }
        }

        // 实时拦截模式
        if (_rule && _rule.requestLive) {
          const requestInfo = {
            url: _originalUrl, // 使用原始URL
            method: _method,
            originalRequest: { body: _body }
          }

          if (self.openRealtimeEditor) {
            self.openRealtimeEditor(requestInfo, function(modifiedRequest) {
              // 用户确认发送，应用修改
              if (modifiedRequest) {
                if (modifiedRequest.url) {
                  // GET 请求：重新打开连接使用新 URL
                  xhr.open(_method, modifiedRequest.url, true)
                  requestData = new URL(modifiedRequest.url).search
                }
                
                // 处理请求体
                if (modifiedRequest.body !== undefined) {
                  _body = typeof modifiedRequest.body === 'object' 
                    ? JSON.stringify(modifiedRequest.body) 
                    : modifiedRequest.body
                }
                
                // 处理方法
                if (modifiedRequest.method) {
                  _method = modifiedRequest.method
                  // 重新打开连接使用新方法
                  xhr.open(_method, _url, true)
                }
                
                // 处理请求头
                if (modifiedRequest.headers) {
                  Object.entries(modifiedRequest.headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value)
                  })
                }
              }

              // 发送修改后的请求
              origSend.call(xhr, _body)

              // 监听响应
              xhr.addEventListener('readystatechange', function() {
                if (xhr.readyState === 4) {
                  let responseData
                  if (xhr.responseType === '' || xhr.responseType === 'text') {
                    try {
                      responseData = JSON.parse(xhr.responseText)
                    } catch (e) {
                      responseData = xhr.responseText
                    }
                  } else {
                    responseData = '[non-text response]'
                  }

                  // 检查是否需要响应拦截（并发请求跳过）
                  const currentRule = self.interceptRules.get(_originalUrl)
                  if (currentRule && currentRule.responseLive && !window._isConcurrentRequest) {
                    // 响应实时拦截
                    if (self.openResponseLiveEditor) {
                      self.openResponseLiveEditor({ url: _originalUrl, method: _method }, responseData, function(edited) {
                        // 用户确认修改响应
                        self.addLog({
                          type: 'xhr',
                          method: _method,
                          url: _originalUrl,
                          requestData: requestData,
                          status: xhr.status,
                          responseData: edited,
                          timeMs: Date.now() - _start,
                          intercepted: true,
                          interceptedType: 'both',
                          interceptedRequest: true,
                          interceptedResponse: true
                        })
                      }, function() {
                        // 用户取消响应修改，使用原始响应
                        self.addLog({
                          type: 'xhr',
                          method: _method,
                          url: _originalUrl,
                          requestData: requestData,
                          status: xhr.status,
                          responseData: responseData,
                          timeMs: Date.now() - _start,
                          intercepted: true,
                          interceptedType: 'request',
                          interceptedRequest: true
                        })
                      })
                    }
                  } else {
                    // 只有请求拦截，没有响应拦截
                    self.addLog({
                      type: 'xhr',
                      method: _method,
                      url: _originalUrl,
                      requestData: requestData,
                      status: xhr.status,
                      responseData: responseData,
                      timeMs: Date.now() - _start,
                      intercepted: true,
                      interceptedType: 'request',
                      interceptedRequest: true
                    })
                  }
                }
              })
            }, function() {
              // 用户取消请求
              // XHR request cancelled by user
            })
          } else {
            // 没有编辑器，直接发送原始请求
            origSend.call(xhr, _body)
          }
        } else if (_rule && _rule.responseLive && !window._isConcurrentRequest) {
          // 只有响应拦截，没有请求拦截（并发请求跳过）
          origSend.call(xhr, _body)

          xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState === 4) {
              let responseData
              if (xhr.responseType === '' || xhr.responseType === 'text') {
                try {
                  responseData = JSON.parse(xhr.responseText)
                } catch (e) {
                  responseData = xhr.responseText
                }
              } else {
                responseData = '[non-text response]'
              }

              // 响应实时拦截
              if (self.openResponseLiveEditor) {
                self.openResponseLiveEditor({ url: _originalUrl, method: _method }, responseData, function(edited) {
                  // 用户确认修改响应
                  self.addLog({
                    type: 'xhr',
                    method: _method,
                    url: _originalUrl,
                    requestData: requestData,
                    status: xhr.status,
                    responseData: edited,
                    timeMs: Date.now() - _start,
                    intercepted: true,
                    interceptedType: 'response',
                    interceptedResponse: true
                  })
                }, function() {
                  // 用户取消响应修改，使用原始响应
                  self.addLog({
                    type: 'xhr',
                    method: _method,
                    url: _originalUrl,
                    requestData: requestData,
                    status: xhr.status,
                    responseData: responseData,
                    timeMs: Date.now() - _start
                  })
                })
              }
            }
          })
        } else {
          // 没有拦截，正常记录
          origSend.call(xhr, _body)

          xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState === 4) {
              let responseData
              if (xhr.responseType === '' || xhr.responseType === 'text') {
                try {
                  responseData = JSON.parse(xhr.responseText)
                } catch (e) {
                  responseData = xhr.responseText
                }
              } else {
                responseData = '[non-text response]'
              }

              self.addLog({
                type: 'xhr',
                method: _method,
                url: _originalUrl,
                requestData: requestData,
                status: xhr.status,
                responseData: responseData,
                timeMs: Date.now() - _start
              })
            }
          })
        }
      }

      return xhr
    }
  }

  /**
   * 添加日志
   */
  addLog(log) {
    // 如果是并发请求，添加并发标识
    if (window._isConcurrentRequest) {
      log.concurrent = true
      log.concurrentIndex = window._concurrentRequestIndex
    }
    
    this.logs.push(log)
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 更新唯一请求列表
    this.updateUniqueRequests(log)

    // 通知监听器
    this.notifyListeners('logAdded', log)
  }

  /**
   * 更新唯一请求列表
   */
  updateUniqueRequests(log) {
    const key = log.url
    if (this.uniqueRequests.has(key)) {
      const existing = this.uniqueRequests.get(key)
      existing.count++
      existing.lastTime = log.timeMs
    } else {
      const rule = this.interceptRules.get(key)
      this.uniqueRequests.set(key, {
        url: log.url,
        method: log.method,
        count: 1,
        lastTime: log.timeMs,
        intercepted: !!(rule && rule.requestLive),
        responseIntercept: !!(rule && rule.responseLive)
      })
    }
    
    // 通知请求列表更新
    this.notifyListeners('uniqueRequestsUpdated', this.uniqueRequests)
  }

  /**
   * 获取日志列表
   */
  getLogs() {
    return this.logs
  }

  /**
   * 清空日志列表
   */
  clearLogs() {
    this.logs = []
    // 可选：通知监听者刷新（沿用 uniqueRequestsUpdated 不合适，这里仅清空网络面板由 UI 自己处理）
  }

  /**
   * 获取唯一请求列表
   */
  getUniqueRequests() {
    return this.uniqueRequests
  }

  /**
   * 获取拦截规则
   */
  getInterceptRules() {
    return this.interceptRules
  }

  /**
   * 设置请求拦截
   */
  setRequestIntercept(url, enabled) {
    if (enabled) {
      const rule = this.interceptRules.get(url) || { url, method: 'GET' }
      rule.requestLive = true
      this.interceptRules.set(url, rule)
    } else {
      const rule = this.interceptRules.get(url)
      if (rule) {
        delete rule.requestLive
        if (Object.keys(rule).length <= 2) { // 只有 url 和 method
          this.interceptRules.delete(url)
        }
      }
    }
    this.updateUniqueRequestInterceptStatus(url)
  }

  /**
   * 设置响应拦截
   */
  setResponseIntercept(url, enabled) {
    if (enabled) {
      const rule = this.interceptRules.get(url) || { url, method: 'GET' }
      rule.responseLive = true
      this.interceptRules.set(url, rule)
    } else {
      const rule = this.interceptRules.get(url)
      if (rule) {
        delete rule.responseLive
        if (Object.keys(rule).length <= 2) { // 只有 url 和 method
          this.interceptRules.delete(url)
        }
      }
    }
    this.updateUniqueRequestInterceptStatus(url)
  }

  /**
   * 更新唯一请求的拦截状态
   */
  updateUniqueRequestInterceptStatus(url) {
    const request = this.uniqueRequests.get(url)
    if (request) {
      const rule = this.interceptRules.get(url)
      request.intercepted = !!(rule && rule.requestLive)
      request.responseIntercept = !!(rule && rule.responseLive)
      this.notifyListeners('uniqueRequestsUpdated', this.uniqueRequests)
    }
  }

  /**
   * 添加事件监听器
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  /**
   * 移除事件监听器
   */
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  /**
   * 通知监听器
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in listener callback:', error)
        }
      })
    }
  }

  /**
   * 清空唯一请求列表
   */
  clearUniqueRequests() {
    this.uniqueRequests.clear()
    this.interceptRules.clear()
    this.notifyListeners('uniqueRequestsUpdated', this.uniqueRequests)
  }

  /**
   * 销毁网络日志记录器
   */
  destroy() {
    // 恢复原始的 fetch 和 XMLHttpRequest
    // 注意：这里需要保存原始引用，实际项目中可能需要更复杂的恢复逻辑
    this.listeners.clear()
    this.logs = []
    this.uniqueRequests.clear()
    this.interceptRules.clear()
  }
}
