import { InputHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import { FormField } from './FormField';
import styles from './Form.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, required, className, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <FormField label={label} error={error} helpText={helpText} required={required} htmlFor={inputId} className={className}>
        <input
          ref={ref}
          id={inputId}
          className={clsx(styles.input, { [styles.invalid]: !!error })}
          required={required}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    );
  }
);

Input.displayName = 'Input';
