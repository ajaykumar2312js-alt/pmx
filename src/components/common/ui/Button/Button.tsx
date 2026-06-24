import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Spinner } from '../Loader/Spinner';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(styles.btn, styles[variant], styles[size], className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
