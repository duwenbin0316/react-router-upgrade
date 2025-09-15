import React, { useEffect, useState } from 'react'

const StrictEvent: React.FC = () => {
  const [resizes, setResizes] = useState(0)

  useEffect(() => {
    const onResize = () => setResizes((n) => n + 1)

    window.addEventListener('resize', onResize)
    // Intentionally no cleanup to show duplicate listeners in StrictMode dev
    // return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div>
      <h2>StrictMode Event Listener Demo</h2>
      <p>Resize count: {resizes}</p>
      <p>In dev + StrictMode, this listener is registered twice without cleanup.</p>
    </div>
  )
}

export default StrictEvent

