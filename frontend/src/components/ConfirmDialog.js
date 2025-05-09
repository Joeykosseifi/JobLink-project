import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  confirmButtonClass = 'btn-danger'
}) => {
  if (!show) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
          <button className="confirm-dialog-close" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 