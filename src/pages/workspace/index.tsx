import React from 'react'
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'
import { Breadcrumb, Layout, Menu } from 'antd'

const WsEditor = React.lazy(() => import('./pages/Editor'))
const WsForm = React.lazy(() => import('./pages/Form'))
const WsTable = React.lazy(() => import('./pages/Table'))

const Workspace: React.FC = () => {
  const { path, url } = useRouteMatch()
  const history = useHistory()
  const location = useLocation()

  const key = location.pathname.endsWith('/editor')
    ? 'editor'
    : location.pathname.endsWith('/form')
    ? 'form'
    : location.pathname.endsWith('/table')
    ? 'table'
    : 'editor'

  const breadcrumb = [
    { title: <Link to="/">Home</Link> },
    { title: <Link to="/workspace">Workspace</Link> },
    { title: key.toUpperCase() },
  ]

  return (
    <Layout style={{ background: 'transparent' }}>
      <Layout.Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[key]}
          onClick={(e) => {
            if (e.key === 'editor') history.push(`${url}/editor`)

            if (e.key === 'form') history.push(`${url}/form`)

            if (e.key === 'table') history.push(`${url}/table`)
          }}
          items={[
            { key: 'editor', label: 'Editor' },
            { key: 'form', label: 'Form' },
            { key: 'table', label: 'Table' },
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
            <CacheSwitch>
              <CacheRoute when="always" path={`${path}/editor`} component={WsEditor} cacheKey="ws-editor" />
              <CacheRoute when="always" path={`${path}/form`} component={WsForm} cacheKey="ws-form" />
              <CacheRoute when="always" path={`${path}/table`} component={WsTable} cacheKey="ws-table" />
              <CacheRoute exact when="always" path={path} component={WsEditor} cacheKey="ws-editor-root" />
            </CacheSwitch>
          </React.Suspense>
        </div>
      </Layout>
    </Layout>
  )
}

export default Workspace


