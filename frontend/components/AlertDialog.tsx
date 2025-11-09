'use client';

import React, { ReactNode } from 'react';
import { Button } from './ui';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: 'bg-red-500/10',
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: 'bg-amber-500/10',
          confirmButton: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
        };
      case 'info':
        return {
          icon: (
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-500/10',
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-dark-bg-card border-2 border-dark-border-primary rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className={`${styles.iconBg} rounded-full p-4`}>
              {styles.icon}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-6 text-center">
            <h3 className="text-2xl font-bold text-dark-text-primary mb-3">
              {title}
            </h3>
            <p className="text-dark-text-secondary leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-8 pb-8">
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              fullWidth
              size="lg"
              onClick={onConfirm}
              loading={loading}
              className={styles.confirmButton}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// Hook for easier usage
export const useAlertDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<AlertDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    description: '',
  });
  const [onConfirmCallback, setOnConfirmCallback] = React.useState<(() => void) | null>(null);

  const showDialog = (
    dialogConfig: Omit<AlertDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>,
    onConfirm: () => void
  ) => {
    setConfig(dialogConfig);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const confirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    close();
  };

  return {
    isOpen,
    showDialog,
    close,
    confirm,
    config,
  };
};

