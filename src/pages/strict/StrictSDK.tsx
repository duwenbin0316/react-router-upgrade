import React, { useEffect, useState } from 'react'

let sdkInstance: { inited: boolean } | null = null

const initSDK = () => {
  if (sdkInstance) return sdkInstance
  sdkInstance = { inited: true }
  return sdkInstance
}

const StrictSDK: React.FC = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Incorrect: init called in effect without guarding or cleanup
    const inst = initSDK()
    if (inst) setCount((n) => n + 1)
    // In development + StrictMode, effect runs twice, count increments twice
  }, [])

  return (
    <div>
      <h2>StrictMode SDK Init Demo</h2>
      <p>Init count: {count}</p>
      <p>Shows duplicate initialization effects under StrictMode dev.</p>
    </div>
  )
}

export default StrictSDK

