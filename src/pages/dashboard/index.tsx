import React from 'react'
import { Link, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Breadcrumb, Layout, Menu } from 'antd'
import { HomeOutlined, UserOutlined, SettingOutlined, BarChartOutlined, LineChartOutlined, MessageOutlined } from '@ant-design/icons'

const DashboardHome = React.lazy(() => import('./Home'))
const Profile = React.lazy(() => import('./Profile'))
const Settings = React.lazy(() => import('./Settings'))
const Reports = React.lazy(() => import('./Reports'))
const Analytics = React.lazy(() => import('./Analytics'))
const Messages = React.lazy(() => import('./Messages'))

const Dashboard: React.FC = () => {
  const { path, url } = useRouteMatch()
  const history = useHistory()
  const location = useLocation()

  const selectedKey = location.pathname.endsWith('/profile')
    ? 'profile'
    : location.pathname.endsWith('/settings')
    ? 'settings'
    : location.pathname.endsWith('/reports')
    ? 'reports'
    : location.pathname.endsWith('/analytics')
    ? 'analytics'
    : location.pathname.endsWith('/messages')
    ? 'messages'
    : 'home'

  const breadcrumbItems = [
    { title: <Link to="/">Home</Link>, icon: <HomeOutlined /> },
    { title: <Link to="/dashboard">Dashboard</Link> },
    selectedKey !== 'home'
      ? { title: (
          selectedKey === 'profile'
            ? 'Profile'
            : selectedKey === 'settings'
            ? 'Settings'
            : selectedKey === 'reports'
            ? 'Reports'
            : selectedKey === 'analytics'
            ? 'Analytics'
            : 'Messages'
        ) }
      : undefined,
  ].filter(Boolean) as { title: React.ReactNode; icon?: React.ReactNode }[]

  return (
    <Layout style={{ background: 'transparent' }}>
      <Layout.Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => {
            if (e.key === 'home') history.push(`${url}`)

            if (e.key === 'profile') history.push(`${url}/profile`)

            if (e.key === 'settings') history.push(`${url}/settings`)

            if (e.key === 'reports') history.push(`${url}/reports`)

            if (e.key === 'analytics') history.push(`${url}/analytics`)

            if (e.key === 'messages') history.push(`${url}/messages`)
          }}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: 'Home' },
            { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
            { key: 'reports', icon: <BarChartOutlined />, label: 'Reports' },
            { key: 'analytics', icon: <LineChartOutlined />, label: 'Analytics' },
            { key: 'messages', icon: <MessageOutlined />, label: 'Messages' },
          ]}
        />
      </Layout.Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          {breadcrumbItems.map((item, idx) => (
            <Breadcrumb.Item key={idx}>
              {item.icon}
              <span style={{ marginLeft: item.icon ? 6 : 0 }}>{item.title}</span>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route exact path={path} component={DashboardHome} />
              <Route path={`${path}/profile`} component={Profile} />
              <Route path={`${path}/settings`} component={Settings} />
              <Route path={`${path}/reports`} component={Reports} />
              <Route path={`${path}/analytics`} component={Analytics} />
              <Route path={`${path}/messages`} component={Messages} />
            </Switch>
          </React.Suspense>
        </div>
      </Layout>
    </Layout>
  )
}

export default Dashboard

