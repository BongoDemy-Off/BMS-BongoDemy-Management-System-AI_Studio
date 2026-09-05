import React, { useState, useEffect } from 'react';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value: string | number;
  onChange: (e: any) => void;
  debounceMs?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({ value, onChange, debounceMs = 300, ...props }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        // Create a fake event object for onChange
        onChange({ target: { value: localValue } } as any);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, value, debounceMs]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onChange({ target: { value: localValue } } as any);
        }
      }}
    />
  );
};

interface DebouncedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  value: string | number;
  onChange: (e: any) => void;
  debounceMs?: number;
}

export const DebouncedTextarea: React.FC<DebouncedTextareaProps> = ({ value, onChange, debounceMs = 300, ...props }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange({ target: { value: localValue } } as any);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, onChange, value, debounceMs]);

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) {
          onChange({ target: { value: localValue } } as any);
        }
      }}
    />
  );
};
