const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 7 || password.length > 9) {
    return { isValid: false, message: 'Password must be between 7 and 9 characters long' };
  }

  const hasUpper = /[A-Z]/.test(password);
  if (!hasUpper) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter' };
  }

  const hasLower = /[a-z]/.test(password);
  if (!hasLower) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter' };
  }

  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least 1 number' };
  }

  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least 1 special character' };
  }

  return { isValid: true, message: 'Password meets all security policy requirements' };
};

module.exports = {
  validatePassword
};
