import * as yup from 'yup';

export const passwordValidationSchema = yup.string()
  .required('Password is required')
  .min(7, 'Password must be at least 7 characters')
  .max(9, 'Password must not exceed 9 characters')
  .matches(/[A-Z]/, 'Must contain at least 1 uppercase letter')
  .matches(/[a-z]/, 'Must contain at least 1 lowercase letter')
  .matches(/[0-9]/, 'Must contain at least 1 number')
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least 1 special character');

export const signupSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  mobileNumber: yup.string().required('Phone Number is required'),
  phoneNumber: yup.string(),
  hospitalName: yup.string().required('Hospital Name is required'),
  password: passwordValidationSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

export const loginSchema = yup.object().shape({
  mobileNumber: yup.string().required('Phone Number is required'),
  password: yup.string().required('Password is required')
});

export const patientSchema = yup.object().shape({
  name: yup.string().required('Patient Name is required'),
  age: yup.number()
    .typeError('Age must be a number')
    .required('Age is required')
    .min(8, 'Patient age must be between 8 and 25 years for BAMP treatment analysis.')
    .max(25, 'Patient age must be between 8 and 25 years for BAMP treatment analysis.'),
  gender: yup.string().required('Gender is required'),
  cvmStage: yup.string().required('CVM Stage is required')
});
