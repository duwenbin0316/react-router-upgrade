import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { push, replace, go, goBack, goForward } from 'connected-react-router'
import type { RootState } from '../store'

const ReduxNavigateDemo: React.FC = () => {
  const dispatch = useDispatch()
  const location = useSelector((s: RootState) => s.router.location)

  return (
    <div>
      <h2>Redux Navigation Demo</h2>

      <div style={{ marginBottom: 12 }}>
        <strong>Current:</strong>
        <div>pathname: {location?.pathname}</div>
        <div>search: {location?.search}</div>
        <div>state: {location?.state ? JSON.stringify(location.state) : 'null'}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => dispatch(push('/workspace/editor'))}>push("/workspace/editor")</button>
        <button onClick={() => dispatch(push({ pathname: '/workspace/form', search: '?from=redux', state: { a: 1 } }))}>
          push(object to /workspace/form)
        </button>
        <button onClick={() => dispatch(replace('/dashboard'))}>replace("/dashboard")</button>
        <button onClick={() => dispatch(goBack())}>goBack()</button>
        <button onClick={() => dispatch(goForward())}>goForward()</button>
        <button onClick={() => dispatch(go(-1))}>go(-1)</button>
        <button onClick={() => dispatch(go(1))}>go(1)</button>
      </div>
    </div>
  )
}

export default ReduxNavigateDemo


