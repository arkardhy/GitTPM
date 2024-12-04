import { useState, useCallback } from 'react';

interface FormState {
  [key: string]: any;
}

interface ValidationRules {
  [key: string]: (value: any) => string | undefined;
}

export function useForm<T extends FormState>(initialState: T, validationRules?: ValidationRules) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback((name: keyof T, value: any) => {
    if (validationRules?.[name as string]) {
      const error = validationRules[name as string](value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
      return !error;
    }
    return true;
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  }, [validateField]);

  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (validationRules[key]) {
        const error = validationRules[key](formData[key]);
        if (error) {
          newErrors[key as keyof T] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
  };
}