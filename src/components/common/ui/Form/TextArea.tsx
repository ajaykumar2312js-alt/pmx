import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import { FormField } from './FormField';
import styles from './Form.module.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helpText, required, className, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <FormField label={label} error={error} helpText={helpText} required={required} htmlFor={inputId} className={className}>
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(styles.textarea, { [styles.invalid]: !!error })}
          required={required}
          aria-invalid={!!error}
          {...props}
        />
      </FormField>
    );
  }
);

TextArea.displayName = 'TextArea';
