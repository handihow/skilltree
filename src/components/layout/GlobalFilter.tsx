import React from 'react'
import { useAsyncDebounce } from 'react-table';

// Define a default UI for filtering
export default function GlobalFilter({
    globalFilter,
    setGlobalFilter,
  }) {
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
      setGlobalFilter(value || undefined)
    }, 200)
  
    return (
      <span>
        <input
          className="input"
          value={value || ""}
          onChange={e => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={'Search records...'}
        />
      </span>
    )
  }
