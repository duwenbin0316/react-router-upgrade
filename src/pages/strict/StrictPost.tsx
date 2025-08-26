import React, { useEffect, useState } from 'react'

const StrictPost: React.FC = () => {
  const [times, setTimes] = useState(0)

  useEffect(() => {
    // Simulate a POST/side-effect (e.g., analytics/log)
    setTimes((n) => n + 1)
    // No idempotency/cleanup; in dev + StrictMode, it runs twice
  }, [])

  return (
    <div>
      <h2>StrictMode Duplicate POST Demo</h2>
      <p>POST simulated times: {times}</p>
      <p>In dev + StrictMode, effect runs twice causing double write.</p>
    </div>
  )
}

export default StrictPost

