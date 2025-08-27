import React, { useState } from 'react'
import { Input, Switch } from 'antd'

const FormPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  return (
    <div>
      <h3>Form</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <div>
          <Switch checked={agree} onChange={setAgree} /> <span style={{ marginLeft: 8 }}>Agree</span>
        </div>
        <div>Preview: {name} | {email} | {String(agree)}</div>
      </div>
    </div>
  )
}

export default FormPage


