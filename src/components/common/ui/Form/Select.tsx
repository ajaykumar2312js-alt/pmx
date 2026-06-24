import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import { FormField } from './FormField';
import styles from './Form.module.css';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, required, className, id, options, placeholder, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <FormField label={label} error={error} helpText={helpText} required={required} htmlFor={inputId} className={className}>
        <select
          ref={ref}
          id={inputId}
          className={clsx(styles.select, { [styles.invalid]: !!error })}
          required={required}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

Select.displayName = 'Select';
