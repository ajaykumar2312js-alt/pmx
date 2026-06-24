import React from 'react';
import clsx from 'clsx';
import styles from './Form.module.css';

interface FormFieldProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FormField = ({
  label,
  error,
  helpText,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) => {
  return (
    <div className={clsx(styles.fieldWrapper, className)}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && <div className={styles.errorText} role="alert">{error}</div>}
      {helpText && !error && <div className={styles.helpText}>{helpText}</div>}
    </div>
  );
};
