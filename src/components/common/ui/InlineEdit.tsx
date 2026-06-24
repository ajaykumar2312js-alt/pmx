import React, { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

type InlineEditValue = string | number | null | undefined;

export interface InlineEditProps {
  value: InlineEditValue;
  onSave: (val: string | undefined) => void;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'number';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  formatDisplay?: (val: InlineEditValue) => React.ReactNode;
  textStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  emptyText?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = 'Click to edit...',
  formatDisplay,
  textStyle = {},
  containerStyle = {},
  emptyText = 'None',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<InlineEditValue>(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (currentValue !== value) {
      onSave(currentValue == null ? undefined : String(currentValue));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderDisplay = () => {
    let displayValue: React.ReactNode = value;

    if (formatDisplay) {
      displayValue = formatDisplay(value);
    } else if (type === 'select') {
      const option = options.find(o => String(o.value) === String(value));
      displayValue = option ? option.label : value;
    } else if (type === 'date' && value) {
      displayValue = new Date(value).toLocaleDateString();
    }

    const isEmpty = value === null || value === undefined || value === '';

    return (
      <div 
        onClick={() => setIsEditing(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          margin: '-0.25rem -0.5rem',
          borderRadius: '4px',
          backgroundColor: isHovered ? 'var(--color-neutral-100)' : 'transparent',
          minHeight: '24px',
          minWidth: '40px',
          transition: 'background-color 0.2s',
          ...containerStyle
        }}
        title="Click to edit"
      >
        <div style={{ 
          ...textStyle, 
          color: isEmpty ? 'var(--color-neutral-500)' : textStyle.color,
          fontStyle: isEmpty ? 'italic' : 'normal',
          whiteSpace: type === 'textarea' ? 'pre-wrap' : 'normal',
          wordBreak: 'break-word'
        }}>
          {isEmpty ? emptyText : displayValue}
        </div>
        {isHovered && <Edit2 size={12} color="var(--color-neutral-500)" style={{ flexShrink: 0 }} />}
      </div>
    );
  };

  const inputStyles: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid var(--color-primary-400)',
    outline: 'none',
    width: '100%',
    minWidth: '150px',
    backgroundColor: 'white',
    color: 'var(--color-neutral-900)',
    ...textStyle
  };

  if (!isEditing) return renderDisplay();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', ...containerStyle }}>
      <div style={{ flex: 1 }}>
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{ ...inputStyles, minHeight: '80px', resize: 'vertical' }}
            onBlur={handleSave}
          />
        ) : type === 'select' ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            style={inputStyles}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'date' ? (
          <input
            type="date"
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={currentValue ? new Date(currentValue).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const dateObj = new Date(e.target.value);
              setCurrentValue(isNaN(dateObj.getTime()) ? null : dateObj.toISOString());
            }}
            onKeyDown={handleKeyDown}
            style={inputStyles}
            onBlur={handleSave}
          />
        ) : (
          <input
            type={type}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={inputStyles}
            onBlur={handleSave}
          />
        )}
      </div>
    </div>
  );
};
