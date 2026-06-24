import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { dismissToast } from '../../../../redux/slices/uiSlice';
import styles from './Toast.module.css';

export const ToastHost = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(dismissToast(toast.id));
      }, 5000),
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.host} aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        if (toast.severity === 'success') Icon = CheckCircle;
        else if (toast.severity === 'error') Icon = AlertCircle;
        else if (toast.severity === 'warning') Icon = AlertTriangle;

        return (
          <div key={toast.id} className={clsx(styles.toast, styles[toast.severity])} role="alert">
            <Icon size={20} className={styles.icon} aria-hidden="true" />
            <div className={styles.content}>{toast.message}</div>
            <button
              type="button"
              className={styles.close}
              onClick={() => dispatch(dismissToast(toast.id))}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
