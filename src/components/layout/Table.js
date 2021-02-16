import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {useMemo} from 'react';
import { Link } from 'react-router-dom';

import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table';
import GlobalFilter from './GlobalFilter';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    )
  }
)

export default function Table({
    data,
    columns,
    header,
    onSelectMultiple,
    selectMultipleButtonText,
    updateData,
    uploadLink,
    isUploadEnabled,
    isEditingEnabled
}) {
    const memorizedData = useMemo(() => data, [data]);
    const memorizedColumns = useMemo(() => columns, [columns]);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
        state,
        setGlobalFilter,
      } = useTable(
        {
          columns: memorizedColumns,
          data: memorizedData,
          updateData
        },
        useGlobalFilter,
        useSortBy,
        useRowSelect,
        hooks => {
          hooks.visibleColumns.push(columns => [
            // Let's make a column for selection
            {
              id: 'selection',
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <div>
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ),
            },
            ...columns,
          ])
        }
      )

      const { globalFilter } =  state;

      return (
        // apply the table props
        <React.Fragment>
        <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h3 className="title is-5">{header}</h3>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
              </div>
              <div className={`level-item ${isEditingEnabled ? '' : 'is-hidden'}`}>
                <button className="button" disabled={selectedFlatRows.length===0} onClick={() => onSelectMultiple(selectedFlatRows.map(
                    d => d.original
                  ))}>{selectMultipleButtonText}</button>
              </div>
              <div className={`level-item ${isUploadEnabled ? '' : 'is-hidden'}`}>
                <Link className="button" to={uploadLink ? uploadLink : ''}>Upload</Link>
              </div>
            </div>
        </div>
        <div className="table-container">
        <table className="table is-fullwidth" {...getTableProps()}>
          <thead>
            {// Loop over the header rows
            headerGroups.map(headerGroup => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {// Render the header
                    column.render('Header')}
                    <span className="icon">
                    {column.isSorted
                      ? column.isSortedDesc
                        ? <FontAwesomeIcon icon="angle-down"/>
                        : <FontAwesomeIcon icon="angle-up"/>
                      : ''}
                  </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {/* Apply the table body props */}
          <tbody {...getTableBodyProps()}>
            {// Loop over the table rows
            rows.map(row => {
              // Prepare the row for display
              prepareRow(row)
              return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                  {// Loop over the rows cells
                  row.cells.map(cell => {
                    // Apply the cell props
                    return (
                      <td {...cell.getCellProps()}>
                        {// Render the cell contents
                        cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td>No data to display...</td></tr>}
          </tbody>
        </table>
        </div>
        </React.Fragment>
      )
     
}
