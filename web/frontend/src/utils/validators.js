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
  email: yup.string().email('Invalid email address').required('Email is required'),
  mobileNumber: yup.string().required('Mobile Number is required'),
  hospitalName: yup.string().required('Hospital Name is required'),
  role: yup.string().required('Role selection is required'),
  password: passwordValidationSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required')
});

export const patientSchema = yup.object().shape({
  name: yup.string().required('Patient Name is required'),
  age: yup.number().positive().required('Age is required'),
  gender: yup.string().required('Gender is required'),
  dob: yup.string().required('Date of Birth is required'),
  contactNumber: yup.string().required('Contact Number is required'),
  chiefComplaint: yup.string().required('Chief Complaint is required'),
  cvmStage: yup.string().required('CVM Stage is required'),
  skeletalAge: yup.number().required('Skeletal Age is required')
});
