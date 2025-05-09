import React, { createContext, useState, useContext } from 'react';
import EditDialog from './EditDialog';

const EditDialogContext = createContext();

export const useEditDialog = () => useContext(EditDialogContext);

export const EditDialogProvider = ({ children }) => {
  const [editDialog, setEditDialog] = useState({
    show: false,
    title: '',
    fields: [],
    values: {},
    onSubmit: null,
    submitText: 'Update'
  });

  const [formValues, setFormValues] = useState({});

  const showEditDialog = ({
    title,
    fields,
    initialValues = {},
    onSubmit,
    submitText = 'Update'
  }) => {
    setFormValues(initialValues);
    setEditDialog({
      show: true,
      title,
      fields: fields.map(field => ({
        ...field,
        onChange: (e) => handleFieldChange(e)
      })),
      onSubmit,
      submitText
    });
  };

  const hideEditDialog = () => {
    setEditDialog(prev => ({ ...prev, show: false }));
    setFormValues({});
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editDialog.onSubmit) {
      editDialog.onSubmit(formValues);
    }
    hideEditDialog();
  };

  return (
    <EditDialogContext.Provider value={{ showEditDialog }}>
      {children}
      <EditDialog
        show={editDialog.show}
        title={editDialog.title}
        fields={editDialog.fields}
        values={formValues}
        onSubmit={handleSubmit}
        onCancel={hideEditDialog}
        submitText={editDialog.submitText}
      />
    </EditDialogContext.Provider>
  );
};

export default EditDialogContext; 