'use client';

import { useEffect, useState } from 'react';
import Icon from './AppIcon';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export default function Notification({
  message,
  isVisible,
  onClose,
  type = 'success',
}: Readonly<NotificationProps>) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !shouldRender) return null;

  const bgColor = {
    success: 'bg-success',
    error: 'bg-destructive',
    info: 'bg-primary',
  }[type];

  const textColor = {
    success: 'text-success-foreground',
    error: 'text-destructive-foreground',
    info: 'text-primary-foreground',
  }[type];

  const iconName = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    info: 'InformationCircleIcon',
  }[type];

  return (
    <div
      className={`fixed right-6 top-24 z-50 animate-slide-down rounded-lg ${bgColor} ${textColor} px-6 py-4 shadow-warm-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px] pointer-events-none'
      }`}
      onTransitionEnd={() => !isVisible && setShouldRender(false)}
    >
      <div className="flex items-center gap-3">
        <Icon name={iconName} size={24} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
