export function isNonEmptyString(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return value.trim().length > 0;
}

export function isChecked(value) {
  return value === true;
}

const ALLOWED_IDENTITY_TYPES = ['National ID', 'Voter ID', 'Passport', 'Other'];

export function validateIdentity(identityType, rawIdentityProof) {
  const type = (identityType || '').toString();
  const value = typeof rawIdentityProof === 'string' ? rawIdentityProof.trim() : '';

  if (!ALLOWED_IDENTITY_TYPES.includes(type)) {
    return {
      valid: false,
      message: 'Invalid identity type selected.',
    };
  }

  if (!isNonEmptyString(value)) {
    return {
      valid: false,
      message: 'Identity proof required.',
    };
  }

  if (rawIdentityProof !== value) {
    return {
      valid: false,
      message: 'Identity proof must not contain leading or trailing spaces.',
    };
  }

  if (type === 'National ID') {
    if (!/^\d{12}$/.test(value)) {
      return {
        valid: false,
        message: 'National ID must be exactly 12 digits.',
      };
    }
  } else if (type === 'Voter ID') {
    if (!/^[A-Z]{3}\d{7}$/i.test(value)) {
      return {
        valid: false,
        message: 'Voter ID must be 3 letters followed by 7 digits (for example, ABC1234567).',
      };
    }
  } else if (type === 'Passport') {
    if (!/^[A-Z]{1,2}\d{6,8}$/i.test(value)) {
      return {
        valid: false,
        message: 'Passport number must start with 1–2 letters followed by 6–8 digits.',
      };
    }
  } else if (type === 'Other') {
    if (!/^[A-Z0-9\-\/]{5,30}$/i.test(value)) {
      return {
        valid: false,
        message: 'Identity proof must be 5–30 characters using letters, digits, - or /.',
      };
    }
  }

  return {
    valid: true,
    message: '',
  };
}
