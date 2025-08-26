import React, { useEffect, useState } from 'react'

const StrictSocket: React.FC = () => {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Fake WebSocket connection object
    const socket = {
      open: true,
      close() { this.open = false },
    }
    setConnected(socket.open)

    // No cleanup: in StrictMode dev, two sockets remain "open"
    // return () => socket.close()
  }, [])

  return (
    <div>
      <h2>StrictMode WebSocket Demo</h2>
      <p>Connected: {String(connected)}</p>
      <p>In dev + StrictMode, effect runs twice and creates duplicate sockets.</p>
    </div>
  )
}

export default StrictSocket

