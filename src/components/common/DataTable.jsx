import React from 'react';
import PropTypes from 'prop-types';

const DataTable = ({
  columns,
  data,
  isLoading,
  loadingMessage = 'Cargando...',
  emptyMessage = 'No hay registros disponibles',
  rowKey,
  size = 'md',
}) => {
  const columnCount = columns.length;

  if (isLoading) {
    return (
      <div className="loading-container text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">{loadingMessage}</span>
        </div>
        <p className="text-muted mb-0">{loadingMessage}</p>
      </div>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="table-responsive">
      <table className={`table table-hover table-${size}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.headerClassName} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!hasData ? (
            <tr>
              <td colSpan={columnCount} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const key = rowKey ? rowKey(item, rowIndex) : rowIndex;
              return (
                <tr key={key}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.cellClassName}>
                      {column.render ? column.render(item, rowIndex) : item[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      render: PropTypes.func,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
  rowKey: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

DataTable.defaultProps = {
  data: [],
  isLoading: false,
  loadingMessage: 'Cargando...',
  emptyMessage: 'No hay registros disponibles',
  size: 'md',
};

export default DataTable;
