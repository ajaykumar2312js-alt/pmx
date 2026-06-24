import { useId } from 'react';
import { FormField } from './FormField';
import styles from './Form.module.css';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helpText,
  required,
  className,
}: RadioGroupProps) => {
  const groupId = useId();

  return (
    <FormField label={label} error={error} helpText={helpText} required={required} className={className}>
      <div className={styles.radioGroup} role="radiogroup" aria-labelledby={label ? groupId : undefined}>
        {label && <span id={groupId} className="sr-only">{label}</span>}
        {options.map((option) => (
          <label key={option.value} className={styles.radioOption}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className={styles.radio}
              required={required}
            />
            <span className={styles.label}>{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
};
