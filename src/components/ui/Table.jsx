import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * Table Component - Interactive data table with sorting
 * Professional design with colorful accents
 */

const Table = ({ data, columns, onRowClick }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'he');
      } else {
        return bStr.localeCompare(aStr, 'he');
      }
    });
  }, [data, sortColumn, sortDirection]);

  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: 'var(--text-sm)'
  };

  const thStyles = {
    backgroundColor: 'var(--color-gray-50)',
    padding: 'var(--space-4)',
    textAlign: 'right',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-gray-700)',
    borderBottom: '2px solid var(--color-gray-200)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all var(--transition-base)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  };

  const tdStyles = {
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-gray-100)',
    color: 'var(--color-gray-900)'
  };

  const getSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown size={14} color="var(--color-gray-400)" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp size={14} color="var(--color-primary-600)" />
      : <ChevronDown size={14} color="var(--color-primary-600)" />;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      border: '1px solid var(--color-gray-200)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        overflowX: 'auto',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    ...thStyles,
                    ...(sortColumn === column.key && {
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-700)'
                    })
                  }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    justifyContent: 'space-between'
                  }}>
                    <span>{column.label}</span>
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--color-gray-50)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--bg-primary)' : 'var(--color-gray-50)';
                }}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} style={tdStyles}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div style={{
          padding: 'var(--space-16)',
          textAlign: 'center',
          color: 'var(--color-gray-500)'
        }}>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
            אין נתונים להצגה
          </p>
        </div>
      )}
    </div>
  );
};

export default Table;
