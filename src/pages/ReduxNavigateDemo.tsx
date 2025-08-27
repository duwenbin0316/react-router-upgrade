import React from 'react'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

const ReduxNavigateDemo: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <div>
      <h2>Redux Navigation Demo</h2>
      <button onClick={() => dispatch(push('/workspace/editor'))}>Go Workspace/Editor</button>
      <button onClick={() => dispatch(push('/dashboard'))} style={{ marginLeft: 12 }}>Go Dashboard</button>
    </div>
  )
}

export default ReduxNavigateDemo


