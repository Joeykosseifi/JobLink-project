import React from 'react';
import './EditDialog.css';

const EditDialog = ({ 
  show, 
  title, 
  fields,
  values,
  onSubmit,
  onCancel,
  submitText = 'Update'
}) => {
  if (!show) return null;

  return (
    <div className="edit-dialog-overlay">
      <div className="edit-dialog">
        <div className="edit-dialog-header">
          <h3>{title}</h3>
          <button className="edit-dialog-close" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="edit-dialog-body">
          <form onSubmit={onSubmit}>
            {fields.map((field) => (
              <div className="form-group" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                <input 
                  type={field.type || 'text'} 
                  id={field.name} 
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => field.onChange(e)}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary">
              {submitText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDialog; 