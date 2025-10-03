import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './DynamicModal.css';

/**
 * A reusable modal component that can be used throughout the application
 * 
 * @param {boolean} isOpen - Whether the modal is open or not
 * @param {function} onClose - Function to call when the modal is closed
 * @param {string} title - The title of the modal
 * @param {React.ReactNode} children - The content of the modal
 * @param {function} onSubmit - Function to call when the form is submitted
 * @param {string} submitText - Text to display on the submit button
 * @param {string} size - Size of the modal (sm, md, lg, xl)
 * @param {boolean} showFooter - Whether to show the footer with buttons
 * @returns {React.ReactElement|null} The modal component or null if not open
 */
const DynamicModalComponent = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  onSubmit,
  submitText = 'Guardar',
  size = 'md', // sm, md, lg, xl
  showFooter = true,
  isSubmitting = false,
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal fade show`} style={{ display: 'block' }} tabIndex="-1">
        <div className={`modal-dialog modal-${size} modal-dialog-centered`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            {onSubmit ? (
              <form onSubmit={onSubmit}>
                <div className="modal-body">{children}</div>
                {showFooter && (
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      )}
                      {submitText}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <>
                <div className="modal-body">{children}</div>
                {showFooter && (
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancelar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DynamicModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  submitText: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showFooter: PropTypes.bool,
  isSubmitting: PropTypes.bool,
};

// Wrap the component with React.memo for better performance and static optimization
const DynamicModal = React.memo(DynamicModalComponent);

export default DynamicModal; 