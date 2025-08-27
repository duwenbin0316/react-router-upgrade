import React, { useMemo, useState } from 'react'
import { Table, Input } from 'antd'

type Row = { key: number; name: string; age: number }

const TablePage: React.FC = () => {
  const [query, setQuery] = useState('')

  const data = useMemo<Row[]>(() =>
    Array.from({ length: 20 }).map((_, i) => ({ key: i, name: `User ${i}`, age: 20 + (i % 10) })),
  [])

  const filtered = useMemo(() => data.filter(r => r.name.toLowerCase().includes(query.toLowerCase())), [data, query])

  return (
    <div>
      <h3>Table</h3>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" style={{ maxWidth: 240, marginBottom: 12 }} />
      <Table<Row> dataSource={filtered} pagination={false} columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Age', dataIndex: 'age' },
      ]} />
    </div>
  )
}

export default TablePage


