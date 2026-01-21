'use client';

import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export type NotificationType = 'error' | 'success' | 'info';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  autoClose?: number; // ms, 0 = no auto close
  onClose?: () => void;
}

const typeStyles: Record<NotificationType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-200',
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-200',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-200',
    icon: <Info className="w-5 h-5 text-blue-500" />,
  },
};

export function Notification({ type, message, autoClose = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const style = typeStyles[type];

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`p-4 rounded-lg ${style.bg} border ${style.border} ${style.text} flex items-start gap-3 animate-in fade-in slide-in-from-top-2`}>
      {style.icon}
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className={`text-current/60 hover:text-current transition-colors`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Array<NotificationProps & { id: string }>>([]);
  const idRef = useRef(0);

  const show = (type: NotificationType, message: string, autoClose = 5000) => {
    const id = (++idRef.current).toString();
    const notification: NotificationProps & { id: string } = {
      id,
      type,
      message,
      autoClose,
      onClose: () => removeNotification(id),
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, show, removeNotification };
}
