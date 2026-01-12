'use client';

import React from 'react';
import Icon from './AppIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const iconName = type === 'danger' ? 'ExclamationTriangleIcon' : 'InformationCircleIcon';
  const confirmBtnColor = type === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl animate-in zoom-in-95 duration-200 border border-border">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${type === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <Icon name={iconName} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-xl ${confirmBtnColor} px-4 py-2.5 text-sm font-bold text-white transition-smooth shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
