import React from 'react';
import { Select } from '../Form/Select';

/** PRD §8.8 — Fibonacci default scale, configurable to a custom numeric scale. */
export const FIBONACCI_SCALE = [1, 2, 3, 5, 8, 13, 21] as const;

export interface StoryPointSelectorProps {
  label?: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  scale?: readonly number[];
  disabled?: boolean;
}

/**
 * Reusable story-point estimator. Shared by Story, Task, and Bug forms so the
 * estimation scale lives in exactly one place (breakdown S8.3 reuse guardrail).
 */
export const StoryPointSelector: React.FC<StoryPointSelectorProps> = ({
  label = 'Story Points',
  value,
  onChange,
  scale = FIBONACCI_SCALE,
  disabled,
}) => {
  return (
    <Select
      label={label}
      value={value != null ? String(value) : ''}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        onChange(e.target.value ? Number(e.target.value) : null)
      }
      options={[
        { label: 'Not estimated', value: '' },
        ...scale.map((p) => ({ label: String(p), value: String(p) })),
      ]}
    />
  );
};
