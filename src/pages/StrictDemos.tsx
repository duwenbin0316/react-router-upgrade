import React from 'react'
import { Link, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Breadcrumb, Layout, Menu } from 'antd'

const StrictIssue = React.lazy(() => import('./strict/StrictIssue'))
const StrictEvent = React.lazy(() => import('./strict/StrictEvent'))
const StrictPost = React.lazy(() => import('./strict/StrictPost'))
const StrictSocket = React.lazy(() => import('./strict/StrictSocket'))
const StrictSDK = React.lazy(() => import('./strict/StrictSDK'))

const StrictHome: React.FC = () => (
  <div>
    <h3>StrictMode Demos</h3>
    <p>Select a demo from the left menu.</p>
  </div>
)

const StrictDemos: React.FC = () => {
  const { path, url } = useRouteMatch()
  const history = useHistory()
  const location = useLocation()

  const key = location.pathname.replace(/.*\/(issue|event|post|socket|sdk)$/i, '$1')
  const selectedKey = ['issue', 'event', 'post', 'socket', 'sdk'].includes(key) ? key : 'home'

  const breadcrumb = [
    { title: <Link to="/">Home</Link> },
    { title: <Link to="/strict">Strict</Link> },
    selectedKey !== 'home' ? { title: selectedKey } : undefined,
  ].filter(Boolean) as { title: React.ReactNode }[]

  return (
    <Layout style={{ background: 'transparent' }}>
      <Layout.Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(e) => {
            if (e.key === 'home') history.push(`${url}`)

            if (e.key === 'issue') history.push(`${url}/issue`)

            if (e.key === 'event') history.push(`${url}/event`)

            if (e.key === 'post') history.push(`${url}/post`)

            if (e.key === 'socket') history.push(`${url}/socket`)

            if (e.key === 'sdk') history.push(`${url}/sdk`)
          }}
          items={[
            { key: 'home', label: 'Overview' },
            { key: 'issue', label: 'Interval Issue' },
            { key: 'event', label: 'Event Listener' },
            { key: 'post', label: 'Duplicate POST' },
            { key: 'socket', label: 'WebSocket' },
            { key: 'sdk', label: 'SDK Init' },
          ]}
        />
      </Layout.Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          {breadcrumb.map((b, i) => (
            <Breadcrumb.Item key={i}>{b.title}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route exact path={path} component={StrictHome} />
              <Route path={`${path}/issue`} component={StrictIssue} />
              <Route path={`${path}/event`} component={StrictEvent} />
              <Route path={`${path}/post`} component={StrictPost} />
              <Route path={`${path}/socket`} component={StrictSocket} />
              <Route path={`${path}/sdk`} component={StrictSDK} />
            </Switch>
          </React.Suspense>
        </div>
      </Layout>
    </Layout>
  )
}

export default StrictDemos

