import React, { useEffect, useRef } from 'react'
import { Button, Space, Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

const DebugTest: React.FC = () => {
  const sdkRef = useRef<any>(null)

  useEffect(() => {
    // 动态导入模块化 SDK
    const initSDK = async () => {
      try {
        // 这里我们直接使用模块化的代码
        // @ts-ignore
        const { ApolloSecurityTester } = await import('../../js-sdk/src/index.js')
        
        sdkRef.current = new ApolloSecurityTester({
          autoStart: true,
          position: 'bottom-right'
        })
        
        sdkRef.current.init()
        console.log('模块化 SDK 初始化成功')
      } catch (error) {
        console.error('SDK 初始化失败:', error)
      }
    }

    initSDK()

    // 清理函数
    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy()
      }
    }
  }, [])

  const testFetch = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
      const data = await response.json()
      console.log('Fetch GET:', data)
    } catch (error) {
      console.error('Fetch 请求失败:', error)
    }
  }

  const testFetchPost = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'hello', body: 'world', userId: 1 })
      })
      const data = await response.json()
      console.log('Fetch POST:', data)
    } catch (error) {
      console.error('Fetch POST 请求失败:', error)
    }
  }

  const testXHR = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/users')
    xhr.onload = () => console.log('XHR GET:')
    xhr.onerror = () => console.error('XHR 请求失败')
    xhr.send()
  }

  const testXHRPost = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://httpbin.org/post')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => console.log('XHR POST:')
    xhr.onerror = () => console.error('XHR POST 请求失败')
    xhr.send(JSON.stringify({ title: 'XHR POST', body: 'test data', userId: 1 }))
  }

  const startSDK = () => {
    if (sdkRef.current) {
      sdkRef.current.start()
    }
  }

  const stopSDK = () => {
    if (sdkRef.current) {
      sdkRef.current.stop()
    }
  }

  const getLogs = () => {
    if (sdkRef.current) {
      const logs = sdkRef.current.getNetworkLogs()
      console.log('网络日志:', logs)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>模块化 SDK 测试页面</Title>
      
      <Card title="SDK 控制" style={{ marginBottom: '20px' }}>
        <Space wrap>
          <Button type="primary" onClick={startSDK}>启动 SDK</Button>
          <Button onClick={stopSDK}>停止 SDK</Button>
          <Button onClick={getLogs}>获取日志</Button>
        </Space>
      </Card>

      <Card title="网络请求测试" style={{ marginBottom: '20px' }}>
        <Paragraph>
          点击下面的按钮发送网络请求，然后在右下角的调试面板中查看请求记录。
        </Paragraph>
        <Space wrap>
          <Button type="primary" onClick={testFetch}>Fetch GET</Button>
          <Button type="primary" onClick={testFetchPost}>Fetch POST</Button>
          <Button type="primary" onClick={testXHR}>XHR GET</Button>
          <Button type="primary" onClick={testXHRPost}>XHR POST</Button>
        </Space>
      </Card>

      <Card title="说明">
        <Paragraph>
          <strong>测试步骤：</strong>
        </Paragraph>
        <ul>
          <li>1. 页面加载后会自动初始化模块化 SDK</li>
          <li>2. 右下角会出现 🐛 按钮，点击可展开调试面板</li>
          <li>3. 点击上面的测试按钮发送网络请求</li>
          <li>4. 在调试面板中查看请求记录和拦截功能</li>
          <li>5. 使用 SDK 控制按钮测试启动/停止功能</li>
        </ul>
      </Card>
    </div>
  )
}

export default DebugTest
