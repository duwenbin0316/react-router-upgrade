import React, { Suspense, useMemo } from 'react'
import { Link, Route, Switch, useLocation, useHistory } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, InfoCircleOutlined, DashboardOutlined } from '@ant-design/icons'
import './App.css'

const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))
const Dashboard = React.lazy(() => import('./pages/dashboard'))
const StrictDemos = React.lazy(() => import('./pages/StrictDemos'))

function App() {
  const location = useLocation()
  const history = useHistory()

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/dashboard')) return '/dashboard'
    if (location.pathname.startsWith('/about')) return '/about'
    if (location.pathname.startsWith('/strict')) return '/strict'
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
          onClick={(e) => history.push(e.key)}
          items={[
            { key: '/', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
            { key: '/about', icon: <InfoCircleOutlined />, label: <Link to="/about">About</Link> },
            { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
            { key: '/strict', label: <Link to="/strict">Strict Demos</Link> },
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
            <Route render={() => <div>Not Found</div>} />
          </Switch>
        </Suspense>
      </Layout.Content>
    </Layout>
  )
}

export default App
