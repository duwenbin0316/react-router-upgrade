(function () {
    // ---------------------------------------------------------------------------
    // 防护：避免重复注入
    // ---------------------------------------------------------------------------
    if (window.__mini_debug_inited) return
    window.__mini_debug_inited = true
  
    // ---------------------------------------------------------------------------
    // 工具方法
    // ---------------------------------------------------------------------------
    function createEl(tag, attrs, children) {
      var el = document.createElement(tag)
  
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          if (k === 'style' && typeof attrs[k] === 'object') {
            Object.assign(el.style, attrs[k])
          } else if (k in el) { 
            el[k] = attrs[k]
          } else {
            el.setAttribute(k, attrs[k])
          }
        })
      }
  
      ;(children || []).forEach(function (c) {
        if (typeof c === 'string') el.appendChild(document.createTextNode(c))
        else if (c) el.appendChild(c)
      })
  
      return el
    }
  
    // 实时响应编辑弹层
    function openResponseLiveEditor(ctx, originalData, onConfirm, onCancel) {
      var overlay = createEl('div', { style: { position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.5)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' } })
      var modal = createEl('div', { style: { background: '#1f1f1f', border: '1px solid #333', borderRadius: '8px', padding: '16px', width: '520px', maxHeight: '80vh', overflow: 'auto' } })
      var title = createEl('div', { style: { fontWeight: '600', color: '#fff', marginBottom: '10px' } }, ['编辑响应 JSON'])
      var info = createEl('div', { style: { fontSize: '12px', color: '#999', marginBottom: '10px' } }, ['URL: ' + ctx.url])
  
      var ta = createEl('textarea', { style: { width: '100%', height: '160px', background: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', color: '#fff', padding: '8px', fontFamily: 'monospace' } })
      try { ta.value = JSON.stringify(originalData, null, 2) } catch (_) { ta.value = String(originalData) }
  
      var actions = createEl('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' } })
      var cancel = createEl('button', { style: { padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' } }, ['取消'])
      var save = createEl('button', { style: { padding: '6px 12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, ['保存'])
  
      actions.appendChild(cancel)
      actions.appendChild(save)
      modal.appendChild(title)
      modal.appendChild(info)
      modal.appendChild(ta)
      modal.appendChild(actions)
      overlay.appendChild(modal)
      document.body.appendChild(overlay)
  
      cancel.onclick = function(){ document.body.removeChild(overlay); if (onCancel) onCancel() }
      save.onclick = function(){
        try {
          var parsed = JSON.parse(ta.value.trim())
          document.body.removeChild(overlay)
          if (onConfirm) onConfirm(parsed)
        } catch (e) {
          alert('JSON 格式错误：' + e.message)
        }
      }
    }
  
    function stringifySafe(v) {
      try {
        if (typeof v === 'string') {
          try { return JSON.stringify(JSON.parse(v), null, 2) } catch (_) { return v }
        }
  
        return JSON.stringify(v, null, 2)
      } catch (_) {
        return String(v)
      }
    }
  
    // ---------------------------------------------------------------------------
    // UI：面板与开关按钮
    // ---------------------------------------------------------------------------
    var panel = createEl('div', {
      id: 'mini-debug-panel',
      style: {
        position: 'fixed',
        width: '500px',
        maxWidth: '90vw',
        height: '320px',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        overflow: 'auto',
        padding: '12px',
        display: 'none',
        zIndex: 999999,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        fontSize: '12px',
      },
    })
  
    var toggleBtn = createEl('button', {
      id: 'mini-debug-toggle',
      style: {
        position: 'fixed',
        width: '48px',
        height: '48px',
        borderRadius: '24px',
        background: '#1677ff',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        zIndex: 999999,
      },
      title: 'Mini Debug',
    }, ['≡'])
  
    var header = createEl('div', { style: { marginBottom: '8px', fontWeight: '600' } }, ['安全测试工具'])
  
    // Tabs
    var tabsBar = createEl('div', {
      style: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
      },
    })
    function makeTabBtn(label) {
      return createEl('button', {
        style: {
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        },
      }, [label])
    }
    var tabBtn1 = makeTabBtn('网络记录')
    var tabBtn2 = makeTabBtn('请求列表')
    var tabBtn3 = makeTabBtn('其他')
    tabsBar.appendChild(tabBtn1)
    tabsBar.appendChild(tabBtn2)
    tabsBar.appendChild(tabBtn3)
  
    // Tab contents
    var tab1 = createEl('div')
    var tab2 = createEl('div')
    var tab3 = createEl('div', null, [createEl('div', { style: { opacity: '0.6' } }, ['（待扩展）'])])
    
    // Tab 2: 请求列表（唯一URL管理）
    var requestCount = createEl('div', { style: { fontSize: '12px', opacity: '0.7', marginBottom: '8px' } }, ['已记录: 0 个唯一请求'])
    var requestList = createEl('div', { id: 'request-list', style: { display: 'grid', gap: '6px' } })
    
    tab2.appendChild(requestCount)
    tab2.appendChild(requestList)
  
    function setActiveTab(idx) {
      tab1.style.display = idx === 1 ? 'block' : 'none'
      tab2.style.display = idx === 2 ? 'block' : 'none'
      tab3.style.display = idx === 3 ? 'block' : 'none'
  
      ;[tabBtn1, tabBtn2, tabBtn3].forEach(function (btn, i) {
        btn.style.background = (i + 1) === idx ? 'rgba(22,119,255,0.35)' : 'rgba(255,255,255,0.08)'
        btn.style.borderColor = (i + 1) === idx ? 'rgba(22,119,255,0.6)' : 'rgba(255,255,255,0.15)'
      })
    }
  
    tabBtn1.onclick = function () { setActiveTab(1) }
    tabBtn2.onclick = function () { setActiveTab(2) }
    tabBtn3.onclick = function () { setActiveTab(3) }
  
    setActiveTab(1)
  
    panel.appendChild(header)
    panel.appendChild(tabsBar)
    panel.appendChild(tab1)
    panel.appendChild(tab2)
    panel.appendChild(tab3)
  
    function togglePanel() {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
    }
  
    // Use onclick to allow updating the handler later without keeping stale refs
    toggleBtn.onclick = togglePanel
  
    document.addEventListener('keydown', function (e) {
      // Ctrl/Cmd + ~ 快捷键
      if ((e.ctrlKey || e.metaKey) && e.key === '`') togglePanel()
    })
  
    document.body.appendChild(panel)
    document.body.appendChild(toggleBtn)
  
    // ---------------------------------------------------------------------------
    // Drag & position (toggle button + panel header)
    // ---------------------------------------------------------------------------
    var enableFollow = true
    // var panelDragged = false  // 面板不再支持单独拖拽
  
    function getNumber(v, fallback) {
      var n = parseFloat(v)
      return isNaN(n) ? fallback : n
    }
  
    // Load last positions
    var savedToggle = (function () {
      try { return JSON.parse(localStorage.getItem('__mini_debug_toggle_pos__') || 'null') } catch (_) { return null }
    })()
    var savedPanel = (function () {
      try { return JSON.parse(localStorage.getItem('__mini_debug_panel_pos__') || 'null') } catch (_) { return null }
    })()
  
    // Init default positions near bottom-right
    function applyInitialPositions() {
      var vw = window.innerWidth || document.documentElement.clientWidth
      var vh = window.innerHeight || document.documentElement.clientHeight
  
      // Toggle default
      var tx = savedToggle && typeof savedToggle.x === 'number' ? savedToggle.x : (vw - 12 - 48)
      var ty = savedToggle && typeof savedToggle.y === 'number' ? savedToggle.y : (vh - 12 - 48)
      toggleBtn.style.left = Math.max(0, tx) + 'px'
      toggleBtn.style.top = Math.max(0, ty) + 'px'
  
      // Panel default
      var panelWidth = getNumber(panel.style.width, 320)
      var panelHeight = getNumber(panel.style.height, 220)
      var px = savedPanel && typeof savedPanel.x === 'number' ? savedPanel.x : (vw - 12 - panelWidth)
      var py = savedPanel && typeof savedPanel.y === 'number' ? savedPanel.y : (vh - 64 - panelHeight)
      panel.style.left = Math.max(0, px) + 'px'
      panel.style.top = Math.max(0, py) + 'px'
    }
  
    applyInitialPositions()
  
    function makeDraggable(targetEl, handleEl, onSave) {
      var dragging = false
      var startX = 0
      var startY = 0
      var originLeft = 0
      var originTop = 0
  
      function onMouseDown(e) {
        // 面板不再支持拖拽，移除 panelDragged 逻辑
        // if (handleEl === header) panelDragged = true
        dragging = true
        startX = e.clientX
        startY = e.clientY
        originLeft = getNumber(targetEl.style.left, 0)
        originTop = getNumber(targetEl.style.top, 0)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        e.preventDefault()
      }
  
      function onMouseMove(e) {
        if (!dragging) return
        var dx = e.clientX - startX
        var dy = e.clientY - startY
        var vw = window.innerWidth || document.documentElement.clientWidth
        var vh = window.innerHeight || document.documentElement.clientHeight
        var rect = targetEl.getBoundingClientRect()
        var newLeft = Math.min(Math.max(0, originLeft + dx), vw - rect.width)
        var newTop = Math.min(Math.max(0, originTop + dy), vh - rect.height)
        targetEl.style.left = newLeft + 'px'
        targetEl.style.top = newTop + 'px'
  
        // 拖拽按钮时，面板始终跟随
        if (targetEl === toggleBtn && enableFollow && panel.style.display === 'block') {
          positionPanelNearToggle()
        }
      }
  
      function onMouseUp() {
        if (!dragging) return
        dragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        if (onSave) {
          var left = getNumber(targetEl.style.left, 0)
          var top = getNumber(targetEl.style.top, 0)
          try { onSave(left, top) } catch (_) {}
        }
      }
  
      handleEl.addEventListener('mousedown', onMouseDown)
    }
  
    makeDraggable(toggleBtn, toggleBtn, function (x, y) {
      try { localStorage.setItem('__mini_debug_toggle_pos__', JSON.stringify({ x: x, y: y })) } catch (_) {}
    })
  
    // 面板不再支持单独拖拽，只跟随按钮
    // makeDraggable(panel, header, function (x, y) {
    //   try { localStorage.setItem('__mini_debug_panel_pos__', JSON.stringify({ x: x, y: y })) } catch (_) {}
    // })
  
    function positionPanelNearToggle() {
      var vw = window.innerWidth || document.documentElement.clientWidth
      var vh = window.innerHeight || document.documentElement.clientHeight
  
      var tRect = toggleBtn.getBoundingClientRect()
      var pRect = panel.getBoundingClientRect()
  
      var gap = 16
      var left = tRect.right - pRect.width
      var top = tRect.top - pRect.height - gap
  
      // If above goes out of view, try below
      if (top < 0) top = Math.min(vh - pRect.height, tRect.bottom + gap)
  
      // Clamp to viewport
      left = Math.min(Math.max(0, left), vw - pRect.width)
      top = Math.min(Math.max(0, top), vh - pRect.height)
  
      panel.style.left = left + 'px'
      panel.style.top = top + 'px'
    }
  
    // Reposition on open if following and not manually dragged
    var _origTogglePanel = togglePanel
    togglePanel = function () {
      var willOpen = panel.style.display === 'none'
      _origTogglePanel()
      if (willOpen && enableFollow) {
        positionPanelNearToggle()
      }
    }
  
    // Re-bind the latest handler so clicks use the updated logic
    toggleBtn.onclick = togglePanel
  
    // ---------------------------------------------------------------------------
    // UI：网络请求区域
    // ---------------------------------------------------------------------------
    var netHeader = createEl('div', { style: { marginTop: '10px', marginBottom: '6px', fontWeight: '600' } }, ['Network'])
    var netList = createEl('div', { id: 'mini-debug-netlist', style: { display: 'grid', gap: '6px' } })
  
    tab1.appendChild(netHeader)
    tab1.appendChild(netList)
  
    function renderNetworkItem(log) {
      var isReqIntercept = !!log.interceptedRequest || log.interceptedType === 'request' || log.interceptedType === 'both'
      var isResIntercept = !!log.interceptedResponse || log.interceptedType === 'response' || log.interceptedType === 'both'
  
      var head = createEl('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isReqIntercept ? 'rgba(255,165,0,0.15)' : (isResIntercept ? 'rgba(19,194,194,0.15)' : 'rgba(255,255,255,0.06)'),
          padding: '6px 8px',
          borderRadius: '6px',
          cursor: 'pointer',
          border: isReqIntercept ? '1px solid rgba(255,165,0,0.4)' : (isResIntercept ? '1px solid rgba(19,194,194,0.4)' : '1px solid transparent'),
        },
      })
  
      var methodBadge = createEl('span', {
        style: {
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 6px',
          borderRadius: '4px',
          background: log.status >= 200 && log.status < 400 ? '#0958d9' : '#cf1322',
        },
      }, [log.method || (log.type === 'xhr' ? 'XHR' : 'FETCH')])
  
      var urlSpan = createEl('span', { style: { wordBreak: 'break-all', flex: '1 1 auto' } }, [log.url])
      // 阶段徽标：请求/响应（可同时显示）
      var phaseWrap = createEl('span', { style: { display: 'inline-flex', gap: '4px' } })
      if (isReqIntercept) {
        phaseWrap.appendChild(createEl('span', { style: { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', background: '#ffa500', color: '#000' }, title: '请求阶段' }, ['REQ']))
      }
      if (isResIntercept) {
        phaseWrap.appendChild(createEl('span', { style: { fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', background: '#13c2c2', color: '#000' }, title: '响应阶段' }, ['RES']))
      }
      var statusSpan = createEl('span', { style: { opacity: '0.85' } }, [String(log.status || '-')])
      var timeSpan = createEl('span', { style: { opacity: '0.7', fontSize: '11px' } }, [log.timeMs + 'ms'])
  
      // 去掉多余图标，只保留 REQ/RES 标签
  
      head.appendChild(methodBadge)
      head.appendChild(urlSpan)
      head.appendChild(statusSpan)
      head.appendChild(phaseWrap)
      head.appendChild(timeSpan)
  
  
      var details = createEl('div', {
        style: {
          display: 'none',
          background: 'rgba(0,0,0,0.3)',
          padding: '8px',
          borderRadius: '6px',
        },
      })
  
      var reqBlock = createEl('div', null, [
        createEl('div', { style: { marginBottom: '4px', fontWeight: '600' } }, ['Request']),
        createEl('pre', { style: { whiteSpace: 'pre-wrap' } }, [stringifySafe(log.requestData || log.requestBody)])
      ])
  
      var resBlock = createEl('div', { style: { marginTop: '6px' } }, [
        createEl('div', { style: { marginBottom: '4px', fontWeight: '600' } }, ['Response']),
        createEl('pre', { style: { whiteSpace: 'pre-wrap' } }, [stringifySafe(log.responseData || log.responseBody)])
      ])
  
      details.appendChild(reqBlock)
      details.appendChild(resBlock)
  
      var wrap = createEl('div', { style: { display: 'grid', gap: '6px' } }, [head, details])
      wrap.setAttribute('data-url', log.url)
      head.className = 'network-item-head'
  
      head.addEventListener('click', function () {
        details.style.display = details.style.display === 'none' ? 'block' : 'none'
      })
  
      return wrap
    }
  
    var netLogs = []
    var uniqueRequests = new Map() // URL -> request info
    var interceptRules = new Map() // URL -> intercept rule
  
    function appendNetworkLog(log) {
      netLogs.push(log)
  
      if (netLogs.length > 200) netLogs.shift()
  
      // 更新唯一请求列表
      updateUniqueRequests(log)
  
      // 只有实际被拦截的请求才标记为拦截状态
      // log.intercepted 已经在拦截逻辑中设置好了
  
      netList.appendChild(renderNetworkItem(log))
    }
  
    function updateUniqueRequests(log) {
      if (!uniqueRequests.has(log.url)) {
        uniqueRequests.set(log.url, {
          url: log.url,
          method: log.method || (log.type === 'xhr' ? 'XHR' : 'FETCH'),
          count: 1,
          lastTime: log.timeMs,
          intercepted: interceptRules.has(log.url)
        })
        // 添加到请求列表
        requestList.appendChild(renderRequestItem(uniqueRequests.get(log.url)))
        updateRequestCount()
      } else {
        // 更新计数和时间
        var request = uniqueRequests.get(log.url)
        request.count++
        request.lastTime = log.timeMs
        // 更新显示
        var item = requestList.querySelector('[data-url="' + log.url + '"]')
        if (item) {
          var countSpan = item.querySelector('.request-count')
          if (countSpan) countSpan.textContent = request.count + '次'
        }
      }
    }
  
    function updateRequestCount() {
      requestCount.textContent = '已记录: ' + uniqueRequests.size + ' 个唯一请求'
    }
  
    function renderRequestItem(request) {
      var item = createEl('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: request.intercepted ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.06)',
          padding: '8px 10px',
          borderRadius: '6px',
          border: request.intercepted ? '1px solid rgba(255,193,7,0.3)' : '1px solid transparent',
        },
      })
      item.setAttribute('data-url', request.url)
  
      var methodBadge = createEl('span', {
        style: {
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 8px',
          borderRadius: '4px',
          background: request.intercepted ? '#ffc107' : '#0958d9',
          color: request.intercepted ? '#000' : '#fff',
        },
      }, [request.method])
  
      var urlSpan = createEl('span', { 
        style: { 
          wordBreak: 'break-all', 
          flex: '1 1 auto',
          fontSize: '12px'
        } 
      }, [request.url])
  
      var countSpan = createEl('span', { 
        style: { 
          fontSize: '11px', 
          opacity: '0.7',
          background: 'rgba(255,255,255,0.1)',
          padding: '2px 6px',
          borderRadius: '3px'
        },
        className: 'request-count'
      }, [request.count + '次'])
  
      var interceptBtn = createEl('button', {
        style: {
          padding: '4px 8px',
          fontSize: '11px',
          borderRadius: '4px',
          background: request.intercepted ? '#ffc107' : 'rgba(255,255,255,0.1)',
          color: request.intercepted ? '#000' : '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600'
        },
        title: '请求拦截',
      }, ['REQ'])
  
      // 响应拦截开关与编辑
      var respOn = !!(request.responseIntercept)
      var respBtn = createEl('button', {
        style: {
          padding: '4px 8px',
          fontSize: '11px',
          borderRadius: '4px',
          background: respOn ? '#13c2c2' : 'rgba(255,255,255,0.1)',
          color: respOn ? '#000' : '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600'
        },
        title: '响应拦截',
      }, ['RES'])
  
      // 实时响应拦截不需要预设规则编辑按钮
  
      // 请求实时拦截不再提供预设规则编辑按钮
  
      item.appendChild(methodBadge)
      item.appendChild(urlSpan)
      item.appendChild(countSpan)
      item.appendChild(interceptBtn)
      
      item.appendChild(respBtn)
  
      // 初始化时设置正确的背景色
      if (request.intercepted || respOn) {
        if (request.intercepted && respOn) {
          // 同时选中：使用混合色渐变
          item.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.15) 0%, rgba(19,194,194,0.15) 100%)'
          item.style.border = '1px solid rgba(255,165,0,0.4)'
        } else if (request.intercepted) {
          // 仅请求拦截：淡黄色
          item.style.background = 'rgba(255,193,7,0.15)'
          item.style.border = '1px solid rgba(255,193,7,0.3)'
        } else if (respOn) {
          // 仅响应拦截：青色
          item.style.background = 'rgba(19,194,194,0.15)'
          item.style.border = '1px solid rgba(19,194,194,0.3)'
        }
      }
      
      // methodBadge 保持默认蓝色，不联动
      methodBadge.style.background = '#0958d9'
      methodBadge.style.color = '#fff'
  
      // 拦截按钮事件
      interceptBtn.onclick = function() {
        if (request.intercepted) {
          // 取消拦截
          interceptRules.delete(request.url)
          request.intercepted = false
          
          // 检查是否还有响应拦截，决定背景色
          if (respOn) {
            // 还有响应拦截，显示青色背景
            item.style.background = 'rgba(19,194,194,0.15)'
            item.style.border = '1px solid rgba(19,194,194,0.3)'
          } else {
            // 没有拦截，恢复默认背景
            item.style.background = 'rgba(255,255,255,0.06)'
            item.style.border = '1px solid transparent'
          }
          
          // methodBadge 保持默认蓝色，不联动
          methodBadge.style.background = '#0958d9'
          methodBadge.style.color = '#fff'
          interceptBtn.textContent = 'REQ'
          interceptBtn.title = '启用拦截'
          interceptBtn.style.background = 'rgba(255,255,255,0.1)'
          interceptBtn.style.color = '#fff'
          
          // 网络记录状态不需要批量更新
        } else {
          // 启用请求实时拦截（仅请求阶段）
          var _ruleOn = interceptRules.get(request.url) || { url: request.url, method: request.method }
          _ruleOn.requestLive = true
          interceptRules.set(request.url, _ruleOn)
          request.intercepted = true
          
          // 如果同时有响应拦截，使用混合色；否则使用淡黄色
          if (respOn) {
            item.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.15) 0%, rgba(19,194,194,0.15) 100%)'
            item.style.border = '1px solid rgba(255,165,0,0.4)'
          } else {
            item.style.background = 'rgba(255,193,7,0.15)'
            item.style.border = '1px solid rgba(255,193,7,0.3)'
          }
          
          // methodBadge 保持默认蓝色，不联动
          methodBadge.style.background = '#0958d9'
          methodBadge.style.color = '#fff'
          interceptBtn.textContent = 'REQ'
          interceptBtn.title = '取消拦截'
          interceptBtn.style.background = '#ffc107'
          interceptBtn.style.color = '#000'
          
          // 网络记录状态不需要批量更新
        }
      }
  
      // 响应拦截按钮
      respBtn.onclick = function() {
        respOn = !respOn
        request.responseIntercept = respOn ? (request.responseIntercept || { status: 200, data: { mocked: true } }) : null
        respBtn.style.background = respOn ? '#13c2c2' : 'rgba(255,255,255,0.1)'
        respBtn.style.color = respOn ? '#000' : '#fff'
        respBtn.textContent = 'RES'
        respBtn.title = respOn ? '取消响应拦截' : '启用响应拦截'
        
        // 更新 item 背景色以保持一致性
        if (respOn) {
          // 如果同时有请求拦截，使用混合色（橙青色渐变）
          if (request.intercepted) {
            item.style.background = 'linear-gradient(135deg, rgba(255,193,7,0.15) 0%, rgba(19,194,194,0.15) 100%)'
            item.style.border = '1px solid rgba(255,165,0,0.4)'
          } else {
            item.style.background = 'rgba(19,194,194,0.15)'
            item.style.border = '1px solid rgba(19,194,194,0.3)'
          }
        } else {
          // 如果还有请求拦截，保持淡黄色；否则恢复默认
          if (request.intercepted) {
            item.style.background = 'rgba(255,193,7,0.15)'
            item.style.border = '1px solid rgba(255,193,7,0.3)'
          } else {
            item.style.background = 'rgba(255,255,255,0.06)'
            item.style.border = '1px solid transparent'
          }
        }
        
        // methodBadge 保持默认蓝色，不联动
        methodBadge.style.background = '#0958d9'
        methodBadge.style.color = '#fff'
        
        // 保存到全局规则（使用 responseLive 标记实时响应拦截）
        var rule = interceptRules.get(request.url) || { url: request.url, method: request.method, mode: 'realtime' }
        rule.responseLive = respOn
        interceptRules.set(request.url, rule)
      }
  
      // 无需编辑按钮
  
      return item
    }
  
  
    // ---------------------------------------------------------------------------
    // 实时拦截弹层
    // ---------------------------------------------------------------------------
    function openRealtimeEditor(requestInfo, onConfirm, onCancel) {
      // 创建遮罩层
      var overlay = createEl('div', {
        style: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: '9999999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      })
  
      // 创建弹层内容
      var modal = createEl('div', {
        style: {
          background: '#1f1f1f',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px',
          width: '500px',
          maxHeight: '80vh',
          overflow: 'auto'
        }
      })
  
      var title = createEl('div', {
        style: {
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#fff'
        }
      }, ['请求被拦截 - 编辑 ' + requestInfo.method + ' 参数'])
  
      var urlInfo = createEl('div', {
        style: {
          fontSize: '12px',
          color: '#999',
          marginBottom: '16px',
          wordBreak: 'break-all'
        }
      }, ['URL: ' + requestInfo.url])
  
      // 请求参数篡改
      var requestSection = createEl('div', {
        style: {
          marginBottom: '20px'
        }
      })
  
      var requestTitle = createEl('div', {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#fff'
        }
      }, [requestInfo.method === 'GET' ? 'URL 参数 (JSON 格式)' : '请求体 (JSON 格式)'])
  
      var requestToggle = createEl('label', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '12px',
          color: '#ccc'
        }
      })
  
      var requestCheckbox = createEl('input', {
        type: 'checkbox',
        style: {
          margin: '0'
        }
      })
  
      var requestLabel = createEl('span', {}, ['启用参数修改'])
  
      // 解析请求参数
      var requestData = {}
      var originalRequest = requestInfo.originalRequest || {}
      
      if (requestInfo.method === 'GET') {
        // GET 请求：解析 URL 参数
        try {
          var url = new URL(requestInfo.url)
          url.searchParams.forEach(function(value, key) {
            requestData[key] = value
          })
        } catch (e) {
          requestData = {}
        }
      } else {
        // POST/PUT 等请求：解析 body
        if (originalRequest.body) {
          try {
            if (typeof originalRequest.body === 'string') {
              requestData = JSON.parse(originalRequest.body)
            } else {
              requestData = originalRequest.body
            }
          } catch (e) {
            requestData = { body: originalRequest.body }
          }
        }
      }
  
      var requestTextarea = createEl('textarea', {
        style: {
          width: '100%',
          height: '120px',
          background: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '8px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'monospace',
          resize: 'vertical'
        },
        value: JSON.stringify(requestData, null, 2),
        placeholder: '编辑 JSON 参数...'
      })
  
      requestToggle.appendChild(requestCheckbox)
      requestToggle.appendChild(requestLabel)
      requestSection.appendChild(requestTitle)
      requestSection.appendChild(requestToggle)
      requestSection.appendChild(requestTextarea)
  
  
      // 按钮区域
      var buttonArea = createEl('div', {
        style: {
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }
      })
  
      var cancelBtn = createEl('button', {
        style: {
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }
      }, ['取消请求'])
  
      var sendBtn = createEl('button', {
        style: {
          padding: '8px 16px',
          background: '#52c41a',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }
      }, ['发送请求'])
  
      buttonArea.appendChild(cancelBtn)
      buttonArea.appendChild(sendBtn)
  
      modal.appendChild(title)
      modal.appendChild(urlInfo)
      modal.appendChild(requestSection)
      // 请求拦截弹窗不包含响应相关内容
      modal.appendChild(buttonArea)
      overlay.appendChild(modal)
  
      document.body.appendChild(overlay)
  
      // 默认启用请求参数修改
      requestCheckbox.checked = true
  
      // 事件处理
      cancelBtn.onclick = function() {
        document.body.removeChild(overlay)
        if (onCancel) onCancel()
      }
  
      sendBtn.onclick = function() {
        var modifiedRequest = null
        
        if (requestCheckbox.checked && requestTextarea.value.trim()) {
          try {
            var editedData = JSON.parse(requestTextarea.value.trim())
            
            if (requestInfo.method === 'GET') {
              // GET 请求：将 JSON 转换为 URL 参数
              var url = new URL(requestInfo.url)
              url.search = '' // 清空原有参数
              
              Object.keys(editedData).forEach(function(key) {
                url.searchParams.set(key, editedData[key])
              })
              
              modifiedRequest = {
                url: url.toString(),
                method: 'GET'
              }
            } else {
              // POST/PUT 等请求：将 JSON 作为 body
              modifiedRequest = {
                body: editedData,
                method: requestInfo.method
              }
            }
          } catch (e) {
            alert('JSON 格式错误：' + e.message)
            return
          }
        }
  
        document.body.removeChild(overlay)
        if (onConfirm) onConfirm(modifiedRequest)
      }
  
      // 点击遮罩关闭
      overlay.onclick = function(e) {
        if (e.target === overlay) {
          document.body.removeChild(overlay)
          if (onCancel) onCancel()
        }
      }
    }
  
    // 预设规则模式已移除
  
    // ---------------------------------------------------------------------------
    // 拦截：fetch
    // ---------------------------------------------------------------------------
    var origFetch = window.fetch && window.fetch.bind(window)
  
    if (origFetch) {
      window.fetch = function (input, init) {
        var url = typeof input === 'string' ? input : (input && input.url) || ''
        var startTime = Date.now()
  
        // 检查是否需要拦截
        var rule = interceptRules.get(url)
        if (rule) {
          // 实时拦截模式
          if (rule.requestLive) {
            return new Promise(function(resolve, reject) {
              var requestInfo = {
                url: url,
                method: init?.method || 'GET',
                originalRequest: init
              }
  
              openRealtimeEditor(requestInfo, function(modifiedRequest) {
                // 用户确认发送，应用修改
                var finalInput = input
                var finalInit = init || {}
                
                if (modifiedRequest) {
                  if (modifiedRequest.url) {
                    // GET 请求：使用修改后的 URL
                    finalInput = modifiedRequest.url
                  }
                  if (modifiedRequest.body) {
                    // POST/PUT 等请求：使用修改后的 body
                    finalInit.body = typeof modifiedRequest.body === 'object' 
                      ? JSON.stringify(modifiedRequest.body) 
                      : modifiedRequest.body
                  }
                  if (modifiedRequest.method) {
                    finalInit.method = modifiedRequest.method
                  }
                }
  
                // 发送修改后的请求
                origFetch(finalInput, finalInit).then(function(response) {
                  var timeMs = Date.now() - startTime
                  var responseClone = response.clone()
  
                  // 若同时开启了响应实时拦截，则在此对响应进行弹窗编辑
                  var latestRule = interceptRules.get(url)
                  if (latestRule && latestRule.responseLive) {
                    responseClone.json().then(function(orig){
                      openResponseLiveEditor({ url: url, method: finalInit.method || 'GET' }, orig, function(edited){
                        var mockResponse = new Response(
                          JSON.stringify(edited),
                          { status: 200, headers: { 'Content-Type': 'application/json' } }
                        )
                        appendNetworkLog({
                          url: url,
                          method: finalInit.method || 'GET',
                          type: 'fetch',
                          status: 200,
                          timeMs: Date.now() - startTime,
                          intercepted: true,
                          interceptedType: 'both',
                          interceptedRequest: true,
                          interceptedResponse: true,
                          requestData: finalInit,
                          responseData: edited
                        })
                        resolve(mockResponse)
                      }, function(){
                        // 用户取消响应编辑，至少记录请求阶段
                        appendNetworkLog({
                          url: url,
                          method: finalInit.method || 'GET',
                          type: 'fetch',
                          status: response.status,
                          timeMs: timeMs,
                          intercepted: true,
                          interceptedType: 'request',
                          interceptedRequest: true,
                          requestData: finalInit,
                          responseData: orig
                        })
                        resolve(response)
                      })
                    }).catch(function(){
                      resolve(response)
                    })
                  } else {
                    responseClone.text().then(function(text) {
                      var responseData
                      try {
                        responseData = JSON.parse(text)
                      } catch (e) {
                        responseData = text
                      }
  
                      appendNetworkLog({
                        url: url,
                        method: finalInit.method || 'GET',
                        type: 'fetch',
                        status: response.status,
                        timeMs: timeMs,
                        intercepted: true,
                        interceptedType: 'request',
                        requestData: finalInit,
                        responseData: responseData
                      })
                    }).catch(function(e) {
                      appendNetworkLog({
                        url: url,
                        method: finalInit.method || 'GET',
                        type: 'fetch',
                        status: response.status,
                        timeMs: timeMs,
                        intercepted: true,
                        interceptedType: 'request',
                        requestData: finalInit,
                        responseData: 'Error reading response: ' + e.message
                      })
                    })
  
                    resolve(response)
                  }
                }).catch(function(error) {
                  var timeMs = Date.now() - startTime
                  appendNetworkLog({
                    url: url,
                    method: finalInit.method || 'GET',
                    type: 'fetch',
                    status: 0,
                    timeMs: timeMs,
                    intercepted: true,
                    interceptedType: 'request',
                    requestData: finalInit,
                    responseData: 'Network Error: ' + error.message
                  })
                  reject(error)
                })
              }, function() {
                // 用户取消请求
                var timeMs = Date.now() - startTime
                appendNetworkLog({
                  url: url,
                  method: init?.method || 'GET',
                  type: 'fetch',
                  status: 0,
                  timeMs: timeMs,
                  intercepted: true,
                  interceptedType: 'request',
                  requestData: init,
                  responseData: 'Request cancelled by user'
                })
                reject(new Error('Request cancelled by user'))
              })
            })
          }
          // 非请求实时模式：可选应用请求参数篡改；并根据响应开关处理响应
          else {
            // 应用请求参数篡改
            if (false && rule.requestTamper) {
              if (rule.requestTamper.headers && init) {
                init.headers = Object.assign(init.headers || {}, rule.requestTamper.headers)
              }
              if (rule.requestTamper.body && init) {
                if (typeof rule.requestTamper.body === 'object') {
                  init.body = JSON.stringify(rule.requestTamper.body)
                } else {
                  init.body = rule.requestTamper.body
                }
              }
            }
  
            // 预设响应篡改（实时弹窗改到响应到达后处理）
            if (false && rule.responseTamper) {
              var mockResponse = new Response(
                JSON.stringify(rule.responseTamper.data || rule.responseTamper),
                {
                  status: rule.responseTamper.status || 200,
                  statusText: rule.responseTamper.statusText || 'OK',
                  headers: rule.responseTamper.headers || { 'Content-Type': 'application/json' }
                }
              )
              
              // 记录拦截的请求
              appendNetworkLog({
                url: url,
                method: init?.method || 'GET',
                type: 'fetch',
                status: rule.responseTamper.status || 200,
                timeMs: Date.now() - startTime,
                intercepted: true,
                requestData: init,
                responseData: rule.responseTamper
              })
              
              return Promise.resolve(mockResponse)
            }
          }
        }
  
        // 正常请求
        return origFetch(input, init).then(function (response) {
          var timeMs = Date.now() - startTime
  
          // 克隆响应以便读取
          var responseClone = response.clone()
  
          // 响应实时编辑：优先于普通记录
          if (rule && rule.responseLive) {
            return responseClone.json().then(function(orig){
              return new Promise(function(resolveLive){
                openResponseLiveEditor({ url: url, method: init?.method || 'GET' }, orig, function(edited){
                  var mockResponse = new Response(
                    JSON.stringify(edited),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                  )
                  appendNetworkLog({
                    url: url,
                    method: init?.method || 'GET',
                    type: 'fetch',
                    status: 200,
                    timeMs: Date.now() - startTime,
                    intercepted: true,
                    interceptedType: 'response',
                    requestData: init,
                    responseData: edited
                  })
                  resolveLive(mockResponse)
                }, function(){
                  resolveLive(response)
                })
              })
            }).catch(function(){
              // 非 JSON 响应则跳过实时编辑，继续默认记录
              return response
            })
          }
  
          responseClone.text().then(function (text) {
            var responseData
            try {
              responseData = JSON.parse(text)
            } catch (e) {
              responseData = text
            }
  
            appendNetworkLog({
              url: url,
              method: init?.method || 'GET',
              type: 'fetch',
              status: response.status,
              timeMs: timeMs,
              intercepted: !!rule,
              requestData: init,
              responseData: responseData
            })
          }).catch(function (e) {
            appendNetworkLog({
              url: url,
              method: init?.method || 'GET',
              type: 'fetch',
              status: response.status,
              timeMs: timeMs,
              intercepted: !!rule,
              requestData: init,
              responseData: 'Error reading response: ' + e.message
            })
          })
  
          return response
        }).catch(function (error) {
          var timeMs = Date.now() - startTime
          appendNetworkLog({
            url: url,
            method: init?.method || 'GET',
            type: 'fetch',
            status: 0,
            timeMs: timeMs,
            intercepted: !!rule,
            requestData: init,
            responseData: 'Network Error: ' + error.message
          })
          throw error
        })
      }
    }
  
    // ---------------------------------------------------------------------------
    // 拦截：XHR
    // ---------------------------------------------------------------------------
    // 拦截：XHR
    // ---------------------------------------------------------------------------
    if (window.XMLHttpRequest) {
      var OrigXHR = window.XMLHttpRequest
  
      function WrappedXHR() {
        var xhr = new OrigXHR()
  
        var _url = ''
        var _method = 'GET'
        var _start = 0
        var _body = undefined
        var _rule = null
  
        var origOpen = xhr.open
        xhr.open = function (method, url) {
          _method = method || 'GET'
          _url = url || ''
          _rule = interceptRules.get(_url)
  
          return origOpen.apply(xhr, arguments)
        }
  
        var origSend = xhr.send
        xhr.send = function (body) {
          _start = Date.now()
          _body = body
  
          // 实时拦截模式
          if (_rule && _rule.requestLive) {
            var requestInfo = {
              url: _url,
              method: _method,
              originalRequest: { body: _body }
            }
  
            openRealtimeEditor(requestInfo, function(modifiedRequest) {
              // 用户确认发送，应用修改
              if (modifiedRequest) {
                if (modifiedRequest.url) {
                  // GET 请求：重新打开连接使用新 URL
                  xhr.open(_method, modifiedRequest.url, true)
                }
                if (modifiedRequest.body) {
                  _body = typeof modifiedRequest.body === 'object' 
                    ? JSON.stringify(modifiedRequest.body) 
                    : modifiedRequest.body
                }
              }
  
              // 添加事件监听器记录网络日志
              xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState === 4) {
                  var responseData
                  try {
                    responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                      ? JSON.parse(xhr.responseText) 
                      : xhr.responseText
                  } catch (e) {
                    responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                      ? xhr.responseText 
                      : '[non-text response]'
                  }
  
                  // 检查是否需要响应拦截
                  var currentRule = interceptRules.get(_url)
                  if (currentRule && currentRule.responseLive) {
                    // 响应实时拦截
                    openResponseLiveEditor({ url: _url, method: _method }, responseData, function(edited) {
                      // 用户确认修改响应
                      appendNetworkLog({
                        type: 'xhr',
                        method: _method,
                        url: _url,
                        requestData: _body,
                        status: xhr.status,
                        responseData: edited,
                        timeMs: Date.now() - _start,
                        interceptedRequest: true,
                        interceptedResponse: true
                      })
                    }, function() {
                      // 用户取消响应修改，使用原始响应
                      appendNetworkLog({
                        type: 'xhr',
                        method: _method,
                        url: _url,
                        requestData: _body,
                        status: xhr.status,
                        responseData: responseData,
                        timeMs: Date.now() - _start,
                        interceptedRequest: true
                      })
                    })
                  } else {
                    // 无响应拦截，正常记录
                    appendNetworkLog({
                      type: 'xhr',
                      method: _method,
                      url: _url,
                      requestData: _body,
                      status: xhr.status,
                      responseData: responseData,
                      timeMs: Date.now() - _start,
                      interceptedRequest: true
                    })
                  }
                }
              })
  
              // 发送修改后的请求
              origSend.call(xhr, _body)
            }, function() {
              // 用户取消请求
              var timeMs = Date.now() - _start
              appendNetworkLog({
                type: 'xhr',
                method: _method,
                url: _url,
                requestData: _body,
                status: 0,
                responseData: 'Request cancelled by user',
                timeMs: timeMs,
                intercepted: true
              })
            })
            
            return
          }
  
          // 仅响应拦截模式（无请求拦截）
          if (_rule && _rule.responseLive && !_rule.requestLive) {
            // 添加事件监听器处理响应拦截
            xhr.addEventListener('readystatechange', function () {
              if (xhr.readyState === 4) {
                var responseData
                try {
                  responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                    ? JSON.parse(xhr.responseText) 
                    : xhr.responseText
                } catch (e) {
                  responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                    ? xhr.responseText 
                    : '[non-text response]'
                }
  
                // 响应实时拦截
                openResponseLiveEditor({ url: _url, method: _method }, responseData, function(edited) {
                  // 用户确认修改响应
                  appendNetworkLog({
                    type: 'xhr',
                    method: _method,
                    url: _url,
                    requestData: _body,
                    status: xhr.status,
                    responseData: edited,
                    timeMs: Date.now() - _start,
                    interceptedResponse: true
                  })
                }, function() {
                  // 用户取消响应修改，使用原始响应
                  appendNetworkLog({
                    type: 'xhr',
                    method: _method,
                    url: _url,
                    requestData: _body,
                    status: xhr.status,
                    responseData: responseData,
                    timeMs: Date.now() - _start
                  })
                })
              }
            })
  
            // 发送原始请求
            return origSend.apply(xhr, arguments)
          }
  
          // 自动篡改模式
          if (_rule && _rule.mode === 'auto') {
            // 应用请求参数篡改
            if (_rule.requestTamper) {
              if (_rule.requestTamper.headers) {
                Object.keys(_rule.requestTamper.headers).forEach(function(key) {
                  xhr.setRequestHeader(key, _rule.requestTamper.headers[key])
                })
              }
              if (_rule.requestTamper.body) {
                _body = typeof _rule.requestTamper.body === 'object' 
                  ? JSON.stringify(_rule.requestTamper.body) 
                  : _rule.requestTamper.body
              }
            }
  
            // 如果设置了响应篡改，模拟响应
            if (_rule.responseLive) {
              // 实时弹窗编辑响应（XHR）
              setTimeout(function(){
                var origText = (xhr.responseType === '' || xhr.responseType === 'text') ? xhr.responseText : ''
                var origJson
                try { origJson = JSON.parse(origText) } catch(_) { origJson = { raw: origText } }
                openResponseLiveEditor({ url: _url, method: _method }, origJson, function(edited){
                  Object.defineProperty(xhr, 'readyState', { value: 4, writable: false })
                  Object.defineProperty(xhr, 'status', { value: 200, writable: false })
                  Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false })
                  Object.defineProperty(xhr, 'responseText', { value: JSON.stringify(edited), writable: false })
                  Object.defineProperty(xhr, 'response', { value: JSON.stringify(edited), writable: false })
                  var event = new Event('readystatechange')
                  xhr.dispatchEvent(event)
                }, function(){
                  // 取消则走原始
                  var event = new Event('readystatechange')
                  xhr.dispatchEvent(event)
                })
              }, 10)
              return
            } else if (_rule.responseTamper) {
              setTimeout(function() {
                // 模拟响应
                Object.defineProperty(xhr, 'readyState', { value: 4, writable: false })
                Object.defineProperty(xhr, 'status', { value: _rule.responseTamper.status || 200, writable: false })
                Object.defineProperty(xhr, 'statusText', { value: _rule.responseTamper.statusText || 'OK', writable: false })
                Object.defineProperty(xhr, 'responseText', { 
                  value: JSON.stringify(_rule.responseTamper.data || _rule.responseTamper), 
                  writable: false 
                })
                Object.defineProperty(xhr, 'response', { 
                  value: JSON.stringify(_rule.responseTamper.data || _rule.responseTamper), 
                  writable: false 
                })
  
                // 触发事件
                var event = new Event('readystatechange')
                xhr.dispatchEvent(event)
              }, 10)
              
              return
            }
          }
  
          xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
              var responseData
              try {
                responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                  ? JSON.parse(xhr.responseText) 
                  : xhr.responseText
              } catch (e) {
                responseData = (xhr.responseType === '' || xhr.responseType === 'text') 
                  ? xhr.responseText 
                  : '[non-text response]'
              }
  
              appendNetworkLog({
                type: 'xhr',
                method: _method,
                url: _url,
                requestData: _body,
                status: xhr.status,
                responseData: responseData,
                timeMs: Date.now() - _start,
                intercepted: !!_rule
              })
            }
          })
  
          return origSend.apply(xhr, arguments)
        }
  
        return xhr
      }
  
      window.XMLHttpRequest = WrappedXHR
    }
  })()
  
  
  