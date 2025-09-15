import React, { Suspense, useMemo } from 'react'
import { Link, Route, Switch, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, InfoCircleOutlined, DashboardOutlined, BugOutlined } from '@ant-design/icons'
import './App.css'

const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))
const Dashboard = React.lazy(() => import('./pages/dashboard'))
const Workspace = React.lazy(() => import('./pages/workspace'))
const StrictDemos = React.lazy(() => import('./pages/StrictDemos'))
const ReduxNavigateDemo = React.lazy(() => import('./pages/ReduxNavigateDemo'))
const DebugTest = React.lazy(() => import('./pages/DebugTest'))

function App() {
  const location = useLocation()

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/dashboard')) return '/dashboard'

    if (location.pathname.startsWith('/about')) return '/about'

    if (location.pathname.startsWith('/strict')) return '/strict'

    if (location.pathname.startsWith('/workspace')) return '/workspace'

    if (location.pathname.startsWith('/redux-nav')) return '/redux-nav'

    if (location.pathname.startsWith('/debug-test')) return '/debug-test'

    return '/'
  }, [location.pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header>
        <div style={{ float: 'left', color: '#fff', fontWeight: 600, marginRight: 24 }}>My App</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
            { key: '/about', icon: <InfoCircleOutlined />, label: <Link to="/about">About</Link> },
            { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
            { key: '/strict', label: <Link to="/strict">Strict Demos</Link> },
            { key: '/workspace', label: <Link to="/workspace/editor">Workspace</Link> },
            { key: '/redux-nav', label: <Link to="/redux-nav">Redux Nav</Link> },
            { key: '/debug-test', icon: <BugOutlined />, label: <Link to="/debug-test">Debug Test</Link> },
          ]}
        />
      </Layout.Header>
      <Layout.Content style={{ padding: 24 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/strict" component={StrictDemos} />
            <Route path="/workspace" component={Workspace} />
            <Route path="/redux-nav" component={ReduxNavigateDemo} />
            <Route path="/debug-test" component={DebugTest} />
            <Route render={() => <div>Not Found</div>} />
          </Switch>
        </Suspense>
      </Layout.Content>
    </Layout>
  )
}

export default App
