import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { FormField } from './FormField';
import styles from './Form.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helpText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <FormField error={error} helpText={helpText} className={className}>
        <div className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            className={styles.checkbox}
            aria-invalid={!!error}
            {...props}
          />
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        </div>
      </FormField>
    );
  }
);

Checkbox.displayName = 'Checkbox';
