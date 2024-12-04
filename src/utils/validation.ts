export const required = (value: any) => 
  !value ? 'This field is required' : undefined;

export const minLength = (min: number) => (value: string) =>
  value && value.length < min ? `Must be at least ${min} characters` : undefined;

export const isValidDate = (value: string) => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? 'Invalid date format' : undefined;
};

export const isValidTime = (value: string) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return !timeRegex.test(value) ? 'Invalid time format (HH:mm)' : undefined;
};

export const isValidEmail = (value: string) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return !emailRegex.test(value) ? 'Invalid email address' : undefined;
};

export const isValidPassword = (value: string) => {
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return undefined;
};

export const isValidPhoneNumber = (value: string) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return !phoneRegex.test(value) ? 'Invalid phone number' : undefined;
};