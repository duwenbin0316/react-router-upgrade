/**
 * 调试面板 UI 组件
 * 负责渲染和管理调试面板界面
 */

export class DebugPanel {
  constructor() {
    this.panel = null
    this.toggleBtn = null
    this.isVisible = false
    this.isInitialized = false
    this.dependencies = {}
  }

  /**
   * 初始化调试面板
   */
  init(options = {}) {
    if (this.isInitialized) {
      return
    }

    this.dependencies = {
      networkLogger: options.networkLogger,
      requestInterceptor: options.requestInterceptor,
      responseInterceptor: options.responseInterceptor,
      storage: options.storage
    }

    this.createPanel()
    this.createToggleButton()
    this.setupEventListeners()
    this.loadSavedPosition()
    this.initDragging()

    this.isInitialized = true
  }

  /**
   * 创建调试面板
   */
  createPanel() {
    this.panel = document.createElement('div')
    this.panel.id = 'mini-debug-panel'
    this.panel.style.cssText = `
      position: fixed;
      width: 500px;
      max-width: 90vw;
      height: 320px;
      background: rgba(0,0,0,0.85);
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      overflow: auto;
      padding: 12px;
      display: none;
      z-index: 999999;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      font-size: 12px;
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 0.15s ease, transform 0.15s ease;
    `

    this.createHeader()
    this.createTabs()
    this.createContent()

    document.body.appendChild(this.panel)
  }

  /**
   * 创建面板头部
   */
  createHeader() {
    const header = document.createElement('div')
    header.style.cssText = `
      margin-bottom: 8px;
      font-weight: 600;
    `
    header.textContent = '安全测试工具'

    this.panel.appendChild(header)
  }

  /**
   * 创建标签页
   */
  createTabs() {
    const tabsContainer = document.createElement('div')
    tabsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    `

    const tabs = [
      { id: 'network', label: '网络记录' },
      { id: 'requests', label: '请求列表' },
      { id: 'other', label: '其他' }
    ]

    tabs.forEach((tab, index) => {
      const tabBtn = document.createElement('button')
      tabBtn.textContent = tab.label
      tabBtn.style.cssText = `
        padding: 4px 8px;
        border-radius: 6px;
        background: ${index === 0 ? 'rgba(22,119,255,0.35)' : 'rgba(255,255,255,0.08)'};
        color: #fff;
        border: 1px solid ${index === 0 ? 'rgba(22,119,255,0.6)' : 'rgba(255,255,255,0.15)'};
        cursor: pointer;
        font-size: 12px;
      `

      tabBtn.addEventListener('click', () => {
        this.switchTab(index + 1) // 使用 1-based 索引
      })

      tabsContainer.appendChild(tabBtn)
    })

    this.panel.appendChild(tabsContainer)
  }

  /**
   * 创建内容区域
   */
  createContent() {
    const content = document.createElement('div')
    content.style.cssText = `
      overflow: auto;
    `

    // 网络记录标签页
    const networkTab = document.createElement('div')
    networkTab.id = 'network-tab'
    networkTab.style.display = 'block'

    const networkHeader = document.createElement('div')
    networkHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      margin-bottom: 6px;
    `
    
    const networkTitle = document.createElement('div')
    networkTitle.style.cssText = `
      font-weight: 600;
      color: #fff;
    `
    networkTitle.textContent = 'Network'
    
    const clearNetworkBtn = document.createElement('button')
    clearNetworkBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M4 7h16" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `
    clearNetworkBtn.style.cssText = `
      padding: 4px;
      border-radius: 4px;
      background: transparent;
      color: #aaa;
      border: 1px solid rgba(255,255,255,0.12);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `
    clearNetworkBtn.onmouseenter = () => { clearNetworkBtn.style.color = '#ff4d4f' }
    clearNetworkBtn.onmouseleave = () => { clearNetworkBtn.style.color = '#aaa' }
    clearNetworkBtn.title = '清空网络记录'
    clearNetworkBtn.addEventListener('click', () => {
      this.clearNetworkLogs()
    })
    
    networkHeader.appendChild(networkTitle)
    networkHeader.appendChild(clearNetworkBtn)
    
    const networkList = document.createElement('div')
    networkList.id = 'network-list'
    networkList.style.cssText = `
      display: grid;
      gap: 6px;
    `
    
    networkTab.appendChild(networkHeader)
    networkTab.appendChild(networkList)

    // 请求列表标签页
    const requestsTab = document.createElement('div')
    requestsTab.id = 'requests-tab'
    requestsTab.style.display = 'none'
    
    const requestHeader = document.createElement('div')
    requestHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `
    
    const requestCount = document.createElement('div')
    requestCount.id = 'request-count'
    requestCount.style.cssText = `
      font-size: 12px;
      opacity: 0.7;
      color: #fff;
    `
    requestCount.textContent = '已记录: 0 个唯一请求'
    
    const clearRequestsBtn = document.createElement('button')
    clearRequestsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M4 7h16" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `
    clearRequestsBtn.style.cssText = `
      padding: 4px;
      border-radius: 4px;
      background: transparent;
      color: #aaa;
      border: 1px solid rgba(255,255,255,0.12);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `
    clearRequestsBtn.onmouseenter = () => { clearRequestsBtn.style.color = '#ff4d4f' }
    clearRequestsBtn.onmouseleave = () => { clearRequestsBtn.style.color = '#aaa' }
    clearRequestsBtn.title = '清空请求列表'
    clearRequestsBtn.addEventListener('click', () => {
      this.clearRequestList()
    })
    
    requestHeader.appendChild(requestCount)
    requestHeader.appendChild(clearRequestsBtn)
    
    const requestList = document.createElement('div')
    requestList.id = 'request-list'
    requestList.style.cssText = `
      display: grid;
      gap: 6px;
    `
    
    requestsTab.appendChild(requestHeader)
    requestsTab.appendChild(requestList)

    // 其他标签页
    const otherTab = document.createElement('div')
    otherTab.id = 'other-tab'
    otherTab.style.display = 'none'
    otherTab.innerHTML = '<div style="opacity: 0.6;">（待扩展）</div>'

    content.appendChild(networkTab)
    content.appendChild(requestsTab)
    content.appendChild(otherTab)

    this.panel.appendChild(content)
  }

  /**
   * 创建切换按钮
   */
  createToggleButton() {
    this.toggleBtn = document.createElement('button')
    this.toggleBtn.id = 'mini-debug-toggle'
    this.toggleBtn.textContent = '≡'
    this.toggleBtn.title = 'Mini Debug'
    this.toggleBtn.style.cssText = `
      position: fixed;
      width: 48px;
      height: 48px;
      background: #1677ff;
      color: #fff;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      z-index: 999999;
      font-size: 18px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `

    this.toggleBtn.addEventListener('click', () => {
      this.toggle()
    })

    document.body.appendChild(this.toggleBtn)
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听网络日志添加事件
    if (this.dependencies.networkLogger) {
      this.dependencies.networkLogger.addListener('logAdded', (log) => {
        this.addNetworkLogItem(log)
      })
      
      // 监听唯一请求列表更新
      this.dependencies.networkLogger.addListener('uniqueRequestsUpdated', (uniqueRequests) => {
        this.updateRequestList(uniqueRequests)
      })
    }
  }

  /**
   * 添加网络日志项
   */
  addNetworkLogItem(log) {
    const networkList = this.panel.querySelector('#network-list')
    if (!networkList) return

    const isReqIntercept = !!log.interceptedRequest || log.interceptedType === 'request' || log.interceptedType === 'both'
    const isResIntercept = !!log.interceptedResponse || log.interceptedType === 'response' || log.interceptedType === 'both'

    const head = document.createElement('div')
    head.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${isReqIntercept ? 'rgba(255,165,0,0.15)' : (isResIntercept ? 'rgba(19,194,194,0.15)' : 'rgba(255,255,255,0.06)')};
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      border: ${isReqIntercept ? '1px solid rgba(255,165,0,0.4)' : (isResIntercept ? '1px solid rgba(19,194,194,0.4)' : '1px solid transparent')};
    `

    // 方法标签
    const methodBadge = document.createElement('span')
    methodBadge.style.cssText = `
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      background: ${log.concurrent ? '#52c41a' : '#0958d9'};
      color: #fff;
      min-width: 40px;
      text-align: center;
    `
    methodBadge.textContent = log.method

    // URL
    const urlSpan = document.createElement('span')
    urlSpan.style.cssText = `
      word-break: break-all;
      flex: 1 1 auto;
      color: #fff;
    `
    urlSpan.textContent = log.url

    // 阶段徽标：请求/响应（可同时显示）
    const phaseWrap = document.createElement('span')
    phaseWrap.style.cssText = `
      display: inline-flex;
      gap: 4px;
    `
    
    if (isReqIntercept) {
      const reqBadge = document.createElement('span')
      reqBadge.style.cssText = `
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 10px;
        background: #ffa500;
        color: #000;
      `
      reqBadge.textContent = 'REQ'
      reqBadge.title = '请求阶段'
      phaseWrap.appendChild(reqBadge)
    }
    
    if (isResIntercept) {
      const resBadge = document.createElement('span')
      resBadge.style.cssText = `
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 10px;
        background: #13c2c2;
        color: #000;
      `
      resBadge.textContent = 'RES'
      resBadge.title = '响应阶段'
      phaseWrap.appendChild(resBadge)
    }

    // 并发请求标识
    if (log.concurrent) {
      const concurrentBadge = document.createElement('span')
      concurrentBadge.style.cssText = `
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 10px;
        background: #52c41a;
        color: #000;
      `
      concurrentBadge.textContent = `并发${log.concurrentIndex || ''}`
      concurrentBadge.title = '并发请求'
      phaseWrap.appendChild(concurrentBadge)
    }

    // 状态
    const statusSpan = document.createElement('span')
    statusSpan.style.cssText = `
      opacity: 0.85;
      color: #fff;
    `
    statusSpan.textContent = String(log.status || '-')

    // 时间
    const timeSpan = document.createElement('span')
    timeSpan.style.cssText = `
      opacity: 0.7;
      font-size: 11px;
      color: #fff;
    `
    timeSpan.textContent = log.timeMs + 'ms'

    // 并发按钮
    const concurrentBtn = document.createElement('button')
    concurrentBtn.style.cssText = `
      font-size: 10px;
      padding: 2px 6px;
      border: 1px solid #52c41a;
      background: rgba(82,196,26,0.1);
      color: #52c41a;
      border-radius: 3px;
      cursor: pointer;
      margin-left: 4px;
    `
    concurrentBtn.textContent = '并发'
    concurrentBtn.title = '并发发送此请求'
    
    // 阻止事件冒泡，避免触发展开/收起
    concurrentBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.openConcurrentDialog(log)
    })

    head.appendChild(methodBadge)
    head.appendChild(urlSpan)
    head.appendChild(phaseWrap)
    head.appendChild(statusSpan)
    head.appendChild(timeSpan)
    head.appendChild(concurrentBtn)

    // 创建详情区域
    const details = document.createElement('div')
    details.style.cssText = `
      display: none;
      padding: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      margin-top: 4px;
      font-size: 11px;
    `

    // 请求详情
    const reqBlock = document.createElement('div')
    reqBlock.style.cssText = `
      margin-bottom: 8px;
    `
    // 处理请求数据显示
    let requestDisplay = '无请求数据'
    if (log.requestData !== null && log.requestData !== undefined) {
      if (log.method === 'GET') {
        // GET请求直接显示查询字符串
        requestDisplay = typeof log.requestData === 'object' ? (log.requestData.search || '无参数') : (log.requestData || '无参数')
      } else if (typeof log.requestData === 'object' && Object.keys(log.requestData).length > 0) {
        requestDisplay = JSON.stringify(log.requestData, null, 2)
      } else if (typeof log.requestData === 'string' && log.requestData.trim()) {
        requestDisplay = log.requestData
      } else if (typeof log.requestData !== 'object') {
        requestDisplay = String(log.requestData)
      }
    }
    
    reqBlock.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: #ffa500;">请求:</div>
      <pre style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 3px; overflow-x: auto; font-size: 10px;">${requestDisplay}</pre>
    `

    // 响应详情
    const resBlock = document.createElement('div')
    
    // 处理响应数据显示
    let responseDisplay = '无响应数据'
    if (log.responseData !== null && log.responseData !== undefined) {
      if (typeof log.responseData === 'object' && Object.keys(log.responseData).length > 0) {
        responseDisplay = JSON.stringify(log.responseData, null, 2)
      } else if (typeof log.responseData === 'string' && log.responseData.trim()) {
        responseDisplay = log.responseData
      } else if (typeof log.responseData !== 'object') {
        responseDisplay = String(log.responseData)
      }
    }
    
    resBlock.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: #13c2c2;">响应:</div>
      <pre style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 3px; overflow-x: auto; font-size: 10px;">${responseDisplay}</pre>
    `

    details.appendChild(reqBlock)
    details.appendChild(resBlock)

    // 创建包装器
    const wrap = document.createElement('div')
    wrap.style.cssText = `
      display: grid;
      gap: 6px;
    `
    wrap.setAttribute('data-url', log.url)
    head.className = 'network-item-head'

    wrap.appendChild(head)
    wrap.appendChild(details)

    // 点击展开/收起详情
    head.addEventListener('click', function () {
      details.style.display = details.style.display === 'none' ? 'block' : 'none'
    })

    networkList.appendChild(wrap)

    // 限制显示数量
    const items = networkList.querySelectorAll('div[data-url]')
    if (items.length > 50) {
      networkList.removeChild(items[0])
    }

    // 滚动到底部
    networkList.scrollTop = networkList.scrollHeight
  }

  /**
   * 更新请求列表
   */
  updateRequestList(uniqueRequests) {
    const requestList = this.panel.querySelector('#request-list')
    const requestCount = this.panel.querySelector('#request-count')
    
    if (!requestList || !requestCount) return

    // 更新计数
    requestCount.textContent = `已记录: ${uniqueRequests.size} 个唯一请求`

    // 清空现有列表
    requestList.innerHTML = ''

    // 添加请求项
    for (const [url, request] of uniqueRequests) {
      const item = this.createRequestItem(request)
      requestList.appendChild(item)
    }
  }

  /**
   * 创建请求项
   */
  createRequestItem(request) {
    const item = document.createElement('div')
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${request.intercepted ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.06)'};
      padding: 8px 10px;
      border-radius: 6px;
      border: ${request.intercepted ? '1px solid rgba(255,193,7,0.3)' : '1px solid transparent'};
    `
    item.setAttribute('data-url', request.url)

    // 方法标签
    const methodBadge = document.createElement('span')
    methodBadge.style.cssText = `
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: ${request.intercepted ? '#ffc107' : '#0958d9'};
      color: ${request.intercepted ? '#000' : '#fff'};
    `
    methodBadge.textContent = request.method

    // URL
    const urlSpan = document.createElement('span')
    urlSpan.style.cssText = `
      word-break: break-all;
      flex: 1 1 auto;
      font-size: 12px;
      color: #fff;
    `
    urlSpan.textContent = request.url

    // 计数
    const countSpan = document.createElement('span')
    countSpan.className = 'request-count'
    countSpan.style.cssText = `
      font-size: 11px;
      opacity: 0.7;
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 3px;
      color: #fff;
    `
    countSpan.textContent = request.count + '次'

    // REQ 按钮
    const reqBtn = document.createElement('button')
    reqBtn.style.cssText = `
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: none;
      cursor: pointer;
      font-weight: 600;
    `
    reqBtn.textContent = 'REQ'
    reqBtn.title = '请求拦截'

    // RES 按钮
    const resBtn = document.createElement('button')
    resBtn.style.cssText = `
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: none;
      cursor: pointer;
      font-weight: 600;
    `
    resBtn.textContent = 'RES'
    resBtn.title = '响应拦截'

    item.appendChild(methodBadge)
    item.appendChild(urlSpan)
    item.appendChild(countSpan)
    item.appendChild(reqBtn)
    item.appendChild(resBtn)

    // 添加按钮交互逻辑
    this.setupRequestItemInteractions(item, request, reqBtn, resBtn, methodBadge)

    return item
  }

  /**
   * 设置请求项的交互逻辑
   */
  setupRequestItemInteractions(item, request, reqBtn, resBtn, methodBadge) {
    const networkLogger = this.dependencies.networkLogger
    if (!networkLogger) return

    // REQ 按钮点击事件
    reqBtn.addEventListener('click', () => {
      const newIntercepted = !request.intercepted
      networkLogger.setRequestIntercept(request.url, newIntercepted)
      
      // 更新按钮样式
      reqBtn.style.background = newIntercepted ? '#ffc107' : 'rgba(255,255,255,0.1)'
      reqBtn.style.color = newIntercepted ? '#000' : '#fff'
      reqBtn.title = newIntercepted ? '取消请求拦截' : '启用请求拦截'
      
      // 更新背景色
      this.updateItemBackground(item, newIntercepted, request.responseIntercept)
    })

    // RES 按钮点击事件
    resBtn.addEventListener('click', () => {
      const newResponseIntercept = !request.responseIntercept
      networkLogger.setResponseIntercept(request.url, newResponseIntercept)
      
      // 更新按钮样式
      resBtn.style.background = newResponseIntercept ? '#13c2c2' : 'rgba(255,255,255,0.1)'
      resBtn.style.color = newResponseIntercept ? '#000' : '#fff'
      resBtn.title = newResponseIntercept ? '取消响应拦截' : '启用响应拦截'
      
      // 更新背景色
      this.updateItemBackground(item, request.intercepted, newResponseIntercept)
    })

    // 初始化按钮状态
    this.updateItemBackground(item, request.intercepted, request.responseIntercept)
    reqBtn.style.background = request.intercepted ? '#ffc107' : 'rgba(255,255,255,0.1)'
    reqBtn.style.color = request.intercepted ? '#000' : '#fff'
    reqBtn.title = request.intercepted ? '取消请求拦截' : '启用请求拦截'
    resBtn.style.background = request.responseIntercept ? '#13c2c2' : 'rgba(255,255,255,0.1)'
    resBtn.style.color = request.responseIntercept ? '#000' : '#fff'
    resBtn.title = request.responseIntercept ? '取消响应拦截' : '启用响应拦截'
  }

  /**
   * 更新项目背景色
   */
  updateItemBackground(item, intercepted, responseIntercept) {
    if (intercepted && responseIntercept) {
      // 同时选中：使用混合色渐变
      item.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.15) 0%, rgba(19,194,194,0.15) 100%)'
      item.style.border = '1px solid rgba(255,165,0,0.4)'
    } else if (intercepted) {
      // 仅请求拦截：淡黄色
      item.style.background = 'rgba(255,193,7,0.15)'
      item.style.border = '1px solid rgba(255,193,7,0.3)'
    } else if (responseIntercept) {
      // 仅响应拦截：青色
      item.style.background = 'rgba(19,194,194,0.15)'
      item.style.border = '1px solid rgba(19,194,194,0.3)'
    } else {
      // 没有拦截：默认背景
      item.style.background = 'rgba(255,255,255,0.06)'
      item.style.border = '1px solid transparent'
    }
  }

  /**
   * 打开实时请求编辑器
   */
  openRealtimeEditor(requestInfo, onConfirm, onCancel) {
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // 创建弹层内容
    const modal = document.createElement('div')
    modal.style.cssText = `
      background: #1f1f1f;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      width: 520px;
      max-height: 80vh;
      overflow: auto;
    `

    const title = document.createElement('div')
    title.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #fff;
    `
    title.textContent = '编辑请求参数'

    const urlInfo = document.createElement('div')
    urlInfo.style.cssText = `
      font-size: 12px;
      color: #999;
      margin-bottom: 16px;
    `
    urlInfo.textContent = `URL: ${requestInfo.url}`

    // 请求参数编辑区域
    const requestSection = document.createElement('div')
    requestSection.style.cssText = `
      margin-bottom: 16px;
    `

    const requestLabel = document.createElement('div')
    requestLabel.style.cssText = `
      font-weight: 600;
      margin-bottom: 8px;
      color: #ffa500;
    `
    requestLabel.textContent = '请求参数:'

    const textarea = document.createElement('textarea')
    textarea.style.cssText = `
      width: 100%;
      height: 160px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #fff;
      padding: 8px;
      font-family: monospace;
      font-size: 12px;
    `

    // 智能解析请求参数
    let requestData = {}
    if (requestInfo.originalRequest) {
      if (requestInfo.originalRequest.body) {
        try {
          requestData = JSON.parse(requestInfo.originalRequest.body)
        } catch (e) {
          requestData = { body: requestInfo.originalRequest.body }
        }
      } else if (requestInfo.method === 'GET') {
        // GET 请求解析 URL 参数
        const url = new URL(requestInfo.url)
        requestData = {}
        url.searchParams.forEach((value, key) => {
          // 尝试解析数字，如果失败则保持字符串
          const numValue = Number(value)
          requestData[key] = isNaN(numValue) ? value : numValue
        })
      }
    }
    textarea.value = JSON.stringify(requestData, null, 2)

    requestSection.appendChild(requestLabel)
    requestSection.appendChild(textarea)

    // 按钮区域
    const buttonArea = document.createElement('div')
    buttonArea.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `

    const cancelBtn = document.createElement('button')
    cancelBtn.style.cssText = `
      padding: 4px 8px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid #444;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    `
    cancelBtn.textContent = '取消'

    const sendBtn = document.createElement('button')
    sendBtn.style.cssText = `
      padding: 4px 8px;
      background: #1890ff;
      color: #fff;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    `
    sendBtn.textContent = '发送请求'

    buttonArea.appendChild(cancelBtn)
    buttonArea.appendChild(sendBtn)

    modal.appendChild(title)
    modal.appendChild(urlInfo)
    modal.appendChild(requestSection)
    modal.appendChild(buttonArea)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // 事件处理
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay)
      if (onCancel) onCancel()
    })

    sendBtn.addEventListener('click', () => {
      try {
        // 清理输入内容，移除可能的不可见字符
        const cleanInput = textarea.value.trim()
        if (!cleanInput) {
          alert('请输入有效的JSON数据')
          return
        }
        
        const modifiedData = JSON.parse(cleanInput)
        document.body.removeChild(overlay)
        
        // 根据请求类型处理数据
        let processedData = modifiedData
        
        if (requestInfo.method === 'GET') {
          // GET请求：将参数对象转换回URL格式
          const url = new URL(requestInfo.url)
          url.search = '' // 清空原有参数
          
          // 添加修改后的参数
          Object.entries(modifiedData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              url.searchParams.set(key, String(value))
            }
          })
          
          processedData = {
            url: url.toString()
          }
        } else {
          // POST/PUT等请求：直接使用body内容
          processedData = {
            body: modifiedData
          }
        }
        
        if (onConfirm) onConfirm(processedData)
      } catch (e) {
        alert(`JSON 格式错误：${e.message}\n\n请检查输入内容是否为有效的JSON格式`)
      }
    })

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay)
        if (onCancel) onCancel()
      }
    })
  }

  /**
   * 打开实时响应编辑器
   */
  openResponseLiveEditor(context, originalData, onConfirm, onCancel) {
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // 创建弹层内容
    const modal = document.createElement('div')
    modal.style.cssText = `
      background: #1f1f1f;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      width: 520px;
      max-height: 80vh;
      overflow: auto;
    `

    const title = document.createElement('div')
    title.style.cssText = `
      font-weight: 600;
      color: #fff;
      margin-bottom: 10px;
    `
    title.textContent = '编辑响应 JSON'

    const info = document.createElement('div')
    info.style.cssText = `
      font-size: 12px;
      color: #999;
      margin-bottom: 10px;
    `
    info.textContent = `URL: ${context.url}`

    const textarea = document.createElement('textarea')
    textarea.style.cssText = `
      width: 100%;
      height: 160px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #fff;
      padding: 8px;
      font-family: monospace;
    `
    try {
      textarea.value = JSON.stringify(originalData, null, 2)
    } catch (e) {
      textarea.value = String(originalData)
    }

    const actions = document.createElement('div')
    actions.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 10px;
    `

    const cancel = document.createElement('button')
    cancel.style.cssText = `
      padding: 4px 8px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid #444;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    `
    cancel.textContent = '取消'

    const save = document.createElement('button')
    save.style.cssText = `
      padding: 4px 8px;
      background: #1890ff;
      color: #fff;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    `
    save.textContent = '保存'

    actions.appendChild(cancel)
    actions.appendChild(save)
    modal.appendChild(title)
    modal.appendChild(info)
    modal.appendChild(textarea)
    modal.appendChild(actions)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // 事件处理
    cancel.addEventListener('click', () => {
      document.body.removeChild(overlay)
      if (onCancel) onCancel()
    })

    save.addEventListener('click', () => {
      try {
        const edited = JSON.parse(textarea.value)
        document.body.removeChild(overlay)
        if (onConfirm) onConfirm(edited)
      } catch (e) {
        alert('JSON 格式错误，请检查输入')
      }
    })

    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay)
        if (onCancel) onCancel()
      }
    })
  }

  /**
   * 加载保存的位置
   */
  loadSavedPosition() {
    if (!this.dependencies.storage) {
      return
    }

    const savedTogglePos = this.dependencies.storage.get('toggle_pos')
    if (savedTogglePos) {
      this.toggleBtn.style.left = savedTogglePos.x + 'px'
      this.toggleBtn.style.top = savedTogglePos.y + 'px'
    } else {
      // 默认位置
      const vw = window.innerWidth
      const vh = window.innerHeight
      this.toggleBtn.style.left = (vw - 60) + 'px'
      this.toggleBtn.style.top = (vh - 60) + 'px'
    }
  }

  /**
   * 初始化拖拽功能
   */
  initDragging() {
    this.enableFollow = true
    this.makeDraggable(this.toggleBtn, this.toggleBtn, (x, y) => {
      if (this.dependencies.storage) {
        this.dependencies.storage.set('toggle_pos', { x, y })
      }
    })
  }

  /**
   * 使元素可拖拽
   */
  makeDraggable(targetEl, handleEl, onSave) {
    let dragging = false
    let startX = 0
    let startY = 0
    let originLeft = 0
    let originTop = 0
    let currentX = 0
    let currentY = 0

    const onMouseDown = (e) => {
      dragging = true
      startX = e.clientX
      startY = e.clientY
      originLeft = this.getNumber(targetEl.style.left, 0)
      originTop = this.getNumber(targetEl.style.top, 0)
      currentX = originLeft
      currentY = originTop
      
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      e.preventDefault()
    }

    const onMouseMove = (e) => {
      if (!dragging) return
      
      // 使用 requestAnimationFrame 确保流畅动画
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      
      this.animationFrameId = requestAnimationFrame(() => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        
        currentX = originLeft + dx
        currentY = originTop + dy
        
        // 边界检查
        const vw = window.innerWidth
        const vh = window.innerHeight
        const rect = targetEl.getBoundingClientRect()
        
        if (currentX < 0) currentX = 0
        if (currentY < 0) currentY = 0
        if (currentX > vw - rect.width) currentX = vw - rect.width
        if (currentY > vh - rect.height) currentY = vh - rect.height

        // 直接设置位置，跟随鼠标
        targetEl.style.left = currentX + 'px'
        targetEl.style.top = currentY + 'px'
        
        // 拖拽按钮时，面板始终跟随
        if (targetEl === this.toggleBtn && this.enableFollow && this.panel.style.display === 'block') {
          this.positionPanelNearToggle()
        }
      })
    }

    const onMouseUp = () => {
      if (!dragging) return
      dragging = false
      
      // 清理动画帧
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
      
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      
      if (onSave) {
        try {
          onSave(currentX, currentY)
        } catch (e) {
          console.error('Error saving position:', e)
        }
      }
    }

    handleEl.addEventListener('mousedown', onMouseDown)
  }

  /**
   * 解析数字值
   */
  getNumber(value, fallback) {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }

  /**
   * 将面板定位在切换按钮附近
   */
  positionPanelNearToggle() {
    const vw = window.innerWidth || document.documentElement.clientWidth
    const vh = window.innerHeight || document.documentElement.clientHeight

    const tRect = this.toggleBtn.getBoundingClientRect()
    const panelWidth = 500
    const panelHeight = 320

    const gap = 16
    let left = tRect.right - panelWidth
    let top = tRect.top - panelHeight - gap

    // 如果上方超出视口，尝试下方
    if (top < 0) {
      top = Math.min(vh - panelHeight, tRect.bottom + gap)
    }

    // 限制在视口内
    left = Math.min(Math.max(0, left), vw - panelWidth)
    top = Math.min(Math.max(0, top), vh - panelHeight)

    this.panel.style.left = left + 'px'
    this.panel.style.top = top + 'px'
  }

  /**
   * 切换面板显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 显示面板
   */
  show() {
    this.panel.style.display = 'block'
    this.isVisible = true
    
    if (this.enableFollow) {
      this.positionPanelNearToggle()
    } else {
      this.positionPanel()
    }
    
    // 触发显示动画
    setTimeout(() => {
      this.panel.style.opacity = '1'
      this.panel.style.transform = 'scale(1)'
    }, 10)
  }

  /**
   * 隐藏面板
   */
  hide() {
    // 触发隐藏动画
    this.panel.style.opacity = '0'
    this.panel.style.transform = 'scale(0.9)'
    
    // 动画结束后隐藏
    setTimeout(() => {
      this.panel.style.display = 'none'
      this.isVisible = false
    }, 150)
  }

  /**
   * 定位面板
   */
  positionPanel() {
    const toggleRect = this.toggleBtn.getBoundingClientRect()
    const panelWidth = 500
    const panelHeight = 320
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = toggleRect.left - panelWidth - 10
    let top = toggleRect.top

    // 边界检查
    if (left < 10) {
      left = toggleRect.right + 10
    }
    if (top + panelHeight > vh - 10) {
      top = vh - panelHeight - 10
    }
    if (top < 10) {
      top = 10
    }

    this.panel.style.left = left + 'px'
    this.panel.style.top = top + 'px'
  }

  /**
   * 切换标签页
   */
  switchTab(index) {
    const tabs = this.panel.querySelectorAll('button')
    const contents = this.panel.querySelectorAll('[id$="-tab"]')

    // 更新标签页内容显示
    contents.forEach((content, i) => {
      content.style.display = (i + 1) === index ? 'block' : 'none'
    })

    // 更新标签按钮样式
    tabs.forEach((tab, i) => {
      if (i < 3) { // 只处理前3个标签按钮
        const isActive = (i + 1) === index
        tab.style.background = isActive ? 'rgba(22,119,255,0.35)' : 'rgba(255,255,255,0.08)'
        tab.style.borderColor = isActive ? 'rgba(22,119,255,0.6)' : 'rgba(255,255,255,0.15)'
      }
    })
  }

  /**
   * 销毁调试面板
   */
  destroy() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel)
    }
    if (this.toggleBtn && this.toggleBtn.parentNode) {
      this.toggleBtn.parentNode.removeChild(this.toggleBtn)
    }
    this.isInitialized = false
  }

  /**
   * 打开并发设置对话框
   */
  openConcurrentDialog(log) {
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 99999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // 创建对话框
    const dialog = document.createElement('div')
    dialog.style.cssText = `
      background: #1f1f1f;
      border: 1px solid #434343;
      border-radius: 8px;
      padding: 20px;
      width: 500px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    // 解析请求参数
    let requestParams = {}
    if (log.method === 'GET') {
      // GET请求：解析URL参数
      try {
        const url = new URL(log.url)
        const params = {}
        url.searchParams.forEach((value, key) => {
          params[key] = value
        })
        requestParams = params
      } catch (e) {
        requestParams = {}
      }
    } else {
      // POST/PUT等请求：只解析请求体内容
      if (log.requestData) {
        if (typeof log.requestData === 'object') {
          // 如果requestData是对象，检查是否包含body字段
          if (log.requestData.body) {
            // 如果有body字段，解析body内容
            try {
              requestParams = JSON.parse(log.requestData.body)
            } catch (e) {
              // 如果body不是JSON，作为普通字符串处理
              requestParams = { content: log.requestData.body }
            }
          } else {
            // 如果没有body字段，可能是直接的请求体对象
            requestParams = log.requestData
          }
        } else if (typeof log.requestData === 'string') {
          try {
            // 尝试解析为JSON
            requestParams = JSON.parse(log.requestData)
          } catch (e) {
            // 如果不是JSON，作为普通字符串处理
            requestParams = { content: log.requestData }
          }
        }
      } else {
        requestParams = {}
      }
    }

    dialog.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px 0; color: #fff; font-size: 16px;">并发发送请求</h3>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; color: #fff; margin-bottom: 6px; font-weight: 600;">请求信息：</div>
          <div style="font-size: 12px; color: #fff; word-break: break-all; font-weight: 500;">
            <div><strong>URL:</strong> ${log.url}</div>
            <div><strong>方法:</strong> ${log.method}</div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; color: #fff; margin-bottom: 6px; font-weight: 600;">请求参数：</div>
          <textarea id="concurrent-params" style="
            width: 100%;
            height: 120px;
            background: rgba(0,0,0,0.3);
            border: 1px solid #434343;
            border-radius: 4px;
            padding: 8px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            resize: vertical;
            box-sizing: border-box;
          ">${JSON.stringify(requestParams, null, 2)}</textarea>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <div style="font-size: 13px; color: #fff; margin-bottom: 6px; font-weight: 600;">并发次数：</div>
            <input type="number" id="concurrent-count" value="10" min="1" max="100" style="
              width: 100%;
              padding: 6px;
              background: rgba(0,0,0,0.3);
              border: 1px solid #434343;
              border-radius: 4px;
              color: #fff;
              font-size: 12px;
              box-sizing: border-box;
            ">
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: #fff; margin-bottom: 6px; font-weight: 600;">发送间隔(ms)：</div>
            <input type="number" id="concurrent-interval" value="0" min="0" max="5000" style="
              width: 100%;
              padding: 6px;
              background: rgba(0,0,0,0.3);
              border: 1px solid #434343;
              border-radius: 4px;
              color: #fff;
              font-size: 12px;
              box-sizing: border-box;
            ">
          </div>
        </div>

        <div id="concurrent-progress" style="display: none; margin-bottom: 12px;">
          <div style="font-size: 13px; color: #fff; margin-bottom: 6px; font-weight: 600;">发送进度：</div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 8px; font-size: 11px;">
            <div id="progress-text">准备中...</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="concurrent-cancel" style="
            padding: 6px 12px;
            border: 1px solid #434343;
            background: transparent;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          ">取消</button>
          <button id="concurrent-start" style="
            padding: 6px 12px;
            border: 1px solid #52c41a;
            background: #52c41a;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
          ">开始发送</button>
        </div>
      </div>
    `

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    // 绑定事件
    const cancelBtn = dialog.querySelector('#concurrent-cancel')
    const startBtn = dialog.querySelector('#concurrent-start')
    const paramsTextarea = dialog.querySelector('#concurrent-params')
    const countInput = dialog.querySelector('#concurrent-count')
    const intervalInput = dialog.querySelector('#concurrent-interval')
    const progressDiv = dialog.querySelector('#concurrent-progress')
    const progressText = dialog.querySelector('#progress-text')

    let isSending = false

    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      if (!isSending) {
        document.body.removeChild(overlay)
      }
    })

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && !isSending) {
        document.body.removeChild(overlay)
      }
    })

    // 开始发送按钮
    startBtn.addEventListener('click', async () => {
      if (isSending) return

      try {
        // 验证参数
        const paramsText = paramsTextarea.value.trim()
        let modifiedParams = {}
        
        if (paramsText) {
          try {
            modifiedParams = JSON.parse(paramsText)
          } catch (e) {
            alert(`JSON 格式错误：${e.message}`)
            return
          }
        }

        const count = parseInt(countInput.value) || 10
        const interval = parseInt(intervalInput.value) || 0

        if (count < 1 || count > 100) {
          alert('并发次数必须在 1-100 之间')
          return
        }

        // 开始发送
        isSending = true
        startBtn.textContent = '发送中...'
        startBtn.disabled = true
        progressDiv.style.display = 'block'

        await this.sendConcurrentRequests(log, modifiedParams, count, interval, progressText)

        // 发送完成
        startBtn.textContent = '发送完成'
        setTimeout(() => {
          document.body.removeChild(overlay)
        }, 1000)

      } catch (error) {
        alert(`发送失败：${error.message}`)
        isSending = false
        startBtn.textContent = '开始发送'
        startBtn.disabled = false
        progressDiv.style.display = 'none'
      }
    })
  }

  /**
   * 发送并发请求
   */
  async sendConcurrentRequests(originalLog, modifiedParams, count, interval, progressText) {
    const requests = []
    
    for (let i = 0; i < count; i++) {
      const requestPromise = this.sendSingleConcurrentRequest(originalLog, modifiedParams, i + 1)
      requests.push(requestPromise)
      
      // 更新进度
      progressText.textContent = `发送中... (${i + 1}/${count})`
      
      // 发送间隔
      if (interval > 0 && i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }

    // 等待所有请求完成
    const results = await Promise.allSettled(requests)
    
    // 统计结果
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length
    
    progressText.textContent = `发送完成！成功: ${successCount}, 失败: ${failCount}`
  }

  /**
   * 发送单个并发请求
   */
  async sendSingleConcurrentRequest(originalLog, modifiedParams, index) {
    const startTime = Date.now()
    
    try {
      let url = originalLog.url
      let init = {
        method: originalLog.method,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // 处理参数
      if (originalLog.method === 'GET') {
        // GET请求：将参数添加到URL
        const urlObj = new URL(url)
        urlObj.search = ''
        Object.entries(modifiedParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            urlObj.searchParams.set(key, String(value))
          }
        })
        url = urlObj.toString()
      } else {
        // POST/PUT等请求：将参数作为请求体
        if (Object.keys(modifiedParams).length > 0) {
          init.body = JSON.stringify(modifiedParams)
        } else {
          // 如果没有参数，确保body为空
          init.body = null
        }
      }

      // 标记这是并发请求，避免重复记录
      window._isConcurrentRequest = true
      window._concurrentRequestIndex = index
      
      // 发送请求（走正常的拦截流程）
      const response = await window.fetch(url, init)
      const responseData = await response.text()
      
      // 清除标记
      window._isConcurrentRequest = false
      window._concurrentRequestIndex = null

      return { success: true, response, timeMs }
    } catch (error) {
      // 清除标记
      window._isConcurrentRequest = false
      window._concurrentRequestIndex = null
      
      throw error
    }
  }

  /**
   * 清空网络记录
   */
  clearNetworkLogs() {
    const networkList = this.panel.querySelector('#network-list')
    if (networkList) {
      networkList.innerHTML = ''
    }
    
    // 清空网络日志数据
    if (this.dependencies && this.dependencies.networkLogger) {
      this.dependencies.networkLogger.clearLogs()
    }
  }

  /**
   * 清空请求列表
   */
  clearRequestList() {
    const requestList = this.panel.querySelector('#request-list')
    const requestCount = this.panel.querySelector('#request-count')
    
    if (requestList) {
      requestList.innerHTML = ''
    }
    
    if (requestCount) {
      requestCount.textContent = '已记录: 0 个唯一请求'
    }
    
    // 清空请求列表数据
    if (this.dependencies && this.dependencies.networkLogger) {
      this.dependencies.networkLogger.clearUniqueRequests()
    }
  }

}
