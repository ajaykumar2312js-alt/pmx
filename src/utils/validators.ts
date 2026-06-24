export const validators = {
  required: (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'This field is required';
    if (Array.isArray(value) && value.length === 0) return 'This field is required';
    return null;
  },

  email: (value: string) => {
    if (!value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Invalid email format';
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be at most ${max} characters`;
  },

  numericRange: (min: number, max: number) => (value: number) => {
    if (value === null || value === undefined) return null;
    if (value < min || value > max) return `Must be between ${min} and ${max}`;
    return null;
  },

  isEnum: (enumObj: Record<string, unknown>) => (value: unknown) => {
    if (value === null || value === undefined || value === '') return null;
    return Object.values(enumObj).includes(value) ? null : 'Invalid option selected';
  },
};
