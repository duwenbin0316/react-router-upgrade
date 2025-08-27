import React, { useEffect, useState } from 'react'

// This component intentionally omits cleanup to demonstrate
// React 18 StrictMode double effect invocation in development.
const StrictIssue: React.FC = () => {
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setTicks((t) => t + 1)
    }, 1000)

    // Intentionally NO cleanup to show duplicated timers in StrictMode dev
    // return () => clearInterval(id)
  }, [])

  return (
    <div>
      <h2>StrictMode Demo (Dev only)</h2>
      <p>Ticks: {ticks}</p>
      <p>
        In React 18 development with StrictMode, effects run twice on mount.
        This page omits cleanup to intentionally show duplicated intervals.
      </p>
    </div>
  )
}

export default StrictIssue

