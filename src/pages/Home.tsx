import React from 'react'
import { Button, Space } from 'antd'

const Home: React.FC = () => {
  const doFetch = async () => {
    await fetch('https://jsonplaceholder.typicode.com/todos/1')
  }

  const doPost = async () => {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'hello', body: 'world', userId: 1 }),
    })
  }

  const doXHR = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/users')
    xhr.send()
  }

  const doXHRPost = () => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://httpbin.org/post')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({ title: 'XHR POST', body: 'test data', userId: 1 }))
  }

  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to the home page.</p>
      <Space wrap size="small" style={{ marginTop: 12 }}>
        <Button type="primary" onClick={doFetch}>Fetch GET</Button>
        <Button type="primary" onClick={doPost}>Fetch POST</Button>
        <Button type="primary" onClick={doXHR}>XHR GET</Button>
        <Button type="primary" onClick={doXHRPost}>XHR POST</Button>
      </Space>
    </div>
  )
}

export default Home
