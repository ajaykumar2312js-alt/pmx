import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Modal.module.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
}

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  closeOnOverlayClick = true,
}: DrawerProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      drawerRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="presentation">
      <div
        className={clsx(styles.drawer, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id="drawer-title" className={styles.title}>{title}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
