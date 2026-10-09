import { isValidPhoneNumber } from 'libphonenumber-js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidInternationalPhone(value: string) {
  try {
    return isValidPhoneNumber(value.trim());
  } catch {
    return false;
  }
}
