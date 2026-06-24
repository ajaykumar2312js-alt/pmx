import React, { InputHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import { FormField } from './FormField';
import styles from './Form.module.css';
import { toUtcDate, serializeUtc } from '../../../../utils/dateUtils';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helpText?: string;
  mode?: 'date-only' | 'datetime-utc';
}

/**
 * A date picker that outputs standard ISO strings.
 * In 'datetime-utc' mode, it converts local picked time to UTC string.
 * In 'date-only' mode, it outputs YYYY-MM-DD.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helpText, required, className, id, mode = 'date-only', value, onChange, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    const inputType = mode === 'datetime-utc' ? 'datetime-local' : 'date';

    // Format value for the native input
    let displayValue = '';
    if (value && typeof value === 'string') {
      try {
        if (mode === 'date-only') {
          // just display the YYYY-MM-DD part if possible
          displayValue = value.split('T')[0];
        } else {
          // datetime-local expects YYYY-MM-DDThh:mm
          const d = toUtcDate(value);
          // Format local time for the input
          const offset = d.getTimezoneOffset() * 60000;
          const localDate = new Date(d.getTime() - offset);
          displayValue = localDate.toISOString().slice(0, 16);
        }
      } catch {
        displayValue = value;
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      const rawValue = e.target.value;
      if (!rawValue) {
        onChange(e);
        return;
      }

      try {
        if (mode === 'date-only') {
          // Native date picker outputs YYYY-MM-DD
          const fakeEvent = { ...e, target: { ...e.target, value: rawValue } } as React.ChangeEvent<HTMLInputElement>;
          onChange(fakeEvent);
        } else {
          // Convert the local datetime string to UTC Date, then to ISO
          const d = new Date(rawValue);
          const utcString = serializeUtc(d);
          const fakeEvent = { ...e, target: { ...e.target, value: utcString } } as React.ChangeEvent<HTMLInputElement>;
          onChange(fakeEvent);
        }
      } catch {
        onChange(e);
      }
    };

    return (
      <FormField label={label} error={error} helpText={helpText} required={required} htmlFor={inputId} className={className}>
        <input
          type={inputType}
          ref={ref}
          id={inputId}
          className={clsx(styles.input, { [styles.invalid]: !!error })}
          required={required}
          aria-invalid={!!error}
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
      </FormField>
    );
  }
);

DatePicker.displayName = 'DatePicker';
