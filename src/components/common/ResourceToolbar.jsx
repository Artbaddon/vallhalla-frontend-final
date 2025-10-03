import React from 'react';
import PropTypes from 'prop-types';

const ResourceToolbar = ({ search, filters = [], children }) => {
  if (!search && filters.length === 0 && !children) {
    return null;
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {search && (
            <div className={`col-md-${search.columnSpan || 4}`}>
              {search.label && (
                <label htmlFor={search.id ?? 'resource-search'} className="form-label">
                  {search.label}
                </label>
              )}
              <div className="input-group">
                {search.icon && (
                  <span className="input-group-text">
                    <i className={`bi ${search.icon}`}></i>
                  </span>
                )}
                <input
                  id={search.id ?? 'resource-search'}
                  type="text"
                  className="form-control"
                  placeholder={search.placeholder}
                  value={search.value}
                  onChange={(event) => search.onChange?.(event.target.value)}
                />
              </div>
            </div>
          )}

          {filters.map((filter) => (
            <div className={`col-md-${filter.columnSpan || 4}`} key={filter.id}>
              {filter.label && (
                <label htmlFor={filter.id} className="form-label">
                  {filter.label}
                </label>
              )}
              <div className="input-group">
                {filter.icon && (
                  <span className="input-group-text">
                    <i className={`bi ${filter.icon}`}></i>
                  </span>
                )}
                <select
                  id={filter.id}
                  className="form-select"
                  value={filter.value}
                  onChange={(event) => filter.onChange?.(event.target.value)}
                >
                  <option value="">{filter.placeholder ?? 'Todos'}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {filter.allowClear && filter.value && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => filter.onChange?.('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          ))}

          {children && <div className="col">{children}</div>}
        </div>
      </div>
    </div>
  );
};

ResourceToolbar.propTypes = {
  search: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    icon: PropTypes.string,
    columnSpan: PropTypes.number,
  }),
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      placeholder: PropTypes.string,
      onChange: PropTypes.func,
      icon: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      allowClear: PropTypes.bool,
      columnSpan: PropTypes.number,
    })
  ),
  children: PropTypes.node,
};

export default ResourceToolbar;
