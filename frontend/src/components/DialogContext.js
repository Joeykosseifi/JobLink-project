import React, { createContext, useState, useContext } from 'react';
import ConfirmDialog from './ConfirmDialog';

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmButtonClass: 'btn-danger'
  });

  const showConfirmDialog = ({
    title, 
    message, 
    onConfirm, 
    confirmText = 'Delete', 
    cancelText = 'Cancel', 
    confirmButtonClass = 'btn-danger'
  }) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      confirmButtonClass
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, show: false }));
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    hideConfirmDialog();
  };

  return (
    <DialogContext.Provider value={{ showConfirmDialog }}>
      {children}
      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirm}
        onCancel={hideConfirmDialog}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmButtonClass={confirmDialog.confirmButtonClass}
      />
    </DialogContext.Provider>
  );
};

export default DialogContext; 