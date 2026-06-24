import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Alert.module.css';

export interface AlertProps {
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({ severity, title, message, onClose, className }: AlertProps) => {
  let Icon = Info;
  if (severity === 'success') Icon = CheckCircle;
  else if (severity === 'error') Icon = AlertCircle;
  else if (severity === 'warning') Icon = AlertTriangle;

  return (
    <div className={clsx(styles.alert, styles[severity], className)} role="alert">
      <Icon size={20} className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
