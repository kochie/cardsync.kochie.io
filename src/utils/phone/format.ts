import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  
  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

export function getCountryFromPhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return null;
  }

  try {
    let numberToCheck = phoneNumber;
    
    // Add country code if it's an Australian number starting with 0
    if (phoneNumber.startsWith('0') && phoneNumber.length >= 9) {
      numberToCheck = '+61' + phoneNumber.substring(1);
    }
    
    // Add country code if it's a number without country code
    if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('0') && phoneNumber.length >= 8) {
      numberToCheck = '+61' + phoneNumber;
    }

    if (numberToCheck.startsWith('+')) {
      const parsed = parsePhoneNumber(numberToCheck);
      if (parsed && isValidPhoneNumber(numberToCheck)) {
        return parsed.country || null;
      }
    }
  } catch (error) {
    console.warn('Error determining country from phone number:', phoneNumber, error);
  }

  return null;
}

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return phoneNumber;
  }

  try {
    // Try to parse as international number
    if (phoneNumber.startsWith('+')) {
      const parsed = parsePhoneNumber(phoneNumber);
      if (parsed && isValidPhoneNumber(phoneNumber)) {
        return parsed.formatNational();
      }
    }

    // Try to parse as Australian number (add +61 if it starts with 0)
    if (phoneNumber.startsWith('0') && phoneNumber.length >= 9) {
      const internationalNumber = '+61' + phoneNumber.substring(1);
      const parsed = parsePhoneNumber(internationalNumber);
      if (parsed && isValidPhoneNumber(internationalNumber)) {
        return parsed.formatNational();
      }
    }

    // Try to parse as Australian number without country code
    if (phoneNumber.length >= 8 && !phoneNumber.startsWith('+') && !phoneNumber.startsWith('0')) {
      const internationalNumber = '+61' + phoneNumber;
      const parsed = parsePhoneNumber(internationalNumber);
      if (parsed && isValidPhoneNumber(internationalNumber)) {
        return parsed.formatNational();
      }
    }

    // If all else fails, return the original number
    return phoneNumber;
  } catch (error) {
    console.warn('Error formatting phone number:', phoneNumber, error);
    return phoneNumber;
  }
}

export function getPhoneNumberType(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return 'unknown';
  }

  try {
    let numberToCheck = phoneNumber;
    
    // Add country code if it's an Australian number starting with 0
    if (phoneNumber.startsWith('0') && phoneNumber.length >= 9) {
      numberToCheck = '+61' + phoneNumber.substring(1);
    }
    
    // Add country code if it's a number without country code
    if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('0') && phoneNumber.length >= 8) {
      numberToCheck = '+61' + phoneNumber;
    }

    if (numberToCheck.startsWith('+')) {
      const parsed = parsePhoneNumber(numberToCheck);
      if (parsed && isValidPhoneNumber(numberToCheck)) {
        return parsed.getType() || 'unknown';
      }
    }
  } catch (error) {
    console.warn('Error determining phone number type:', phoneNumber, error);
  }

  return 'unknown';
} 