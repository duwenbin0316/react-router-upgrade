import React, { useState } from 'react'

const Editor: React.FC = () => {
  const [text, setText] = useState('')

  return (
    <div>
      <h3>Editor</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ width: '100%' }}
        placeholder="Type something..."
      />
      <p>Length: {text.length}</p>
    </div>
  )
}

export default Editor


