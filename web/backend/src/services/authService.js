const bcrypt = require('bcryptjs');
const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { validatePassword } = require('../utils/passwordValidator');
const { generateToken } = require('../config/jwt');
const { sendPasswordResetEmail } = require('./emailService');
const { logAction } = require('./auditLogService');

const registerUser = async (userData) => {
  const { fullName, email, mobileNumber, hospitalName, role, password, confirmPassword } = userData;

  if (password !== confirmPassword) {
    throw new Error('Password and Confirm Password do not match');
  }

  const passValidation = validatePassword(password);
  if (!passValidation.isValid) {
    throw new Error(passValidation.message);
  }

  const normalizedEmail = email.toLowerCase();

  // 1. Check if user already exists in Firebase Firestore
  let existingUser = null;
  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) existingUser = userDoc.data();
    } catch (e) {
      console.warn('[Firestore] Registration user lookup fallback:', e.message);
    }
  }
  if (!existingUser) {
    existingUser = inMemoryStore.users.get(normalizedEmail);
  }

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUserObj = {
    uid: `user-${Date.now()}`,
    fullName,
    email: normalizedEmail,
    mobileNumber: mobileNumber || '',
    hospitalName: hospitalName || '',
    role: role || 'Orthodontist',
    password: hashedPassword,
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  // 2. Save directly into Firebase Firestore 'users' collection
  if (db) {
    try {
      await db.collection('users').doc(normalizedEmail).set(newUserObj);
      console.log(`[Firebase Firestore] User registered & stored in 'users' collection: ${normalizedEmail}`);
    } catch (e) {
      console.warn('[Firestore] Save user fallback to memory store:', e.message);
    }
  }
  inMemoryStore.users.set(normalizedEmail, newUserObj);

  const token = generateToken({
    uid: newUserObj.uid,
    email: newUserObj.email,
    role: newUserObj.role,
    fullName: newUserObj.fullName
  });

  await logAction({ userId: newUserObj.uid, userName: fullName, role: newUserObj.role, action: 'USER_REGISTERED_FIREBASE', target: normalizedEmail });

  const { password: pass, ...safeUser } = newUserObj;
  return { token, user: safeUser, message: 'Registration Successful' };
};

const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  let userRecord = null;

  // 1. Query Firebase Firestore 'users' collection first
  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) {
        userRecord = userDoc.data();
      }
    } catch (e) {
      console.warn('[Firestore] Login lookup fallback:', e.message);
    }
  }

  if (!userRecord) {
    userRecord = inMemoryStore.users.get(normalizedEmail);
  }

  if (!userRecord) {
    throw new Error('User Not Found');
  }

  const isMatch = await bcrypt.compare(password, userRecord.password);
  if (!isMatch) {
    throw new Error('Invalid Password');
  }

  const lastLoginAt = new Date().toISOString();
  userRecord.lastLoginAt = lastLoginAt;

  // 2. Update lastLoginAt in Firebase Firestore
  if (db) {
    try {
      await db.collection('users').doc(normalizedEmail).update({ lastLoginAt });
      console.log(`[Firebase Firestore] Updated lastLoginAt for: ${normalizedEmail}`);
    } catch (e) {
      console.warn('[Firestore] Login timestamp update fallback:', e.message);
    }
  }
  inMemoryStore.users.set(normalizedEmail, userRecord);

  const token = generateToken({
    uid: userRecord.uid,
    email: userRecord.email,
    role: userRecord.role,
    fullName: userRecord.fullName
  });

  await logAction({ userId: userRecord.uid, userName: userRecord.fullName, role: userRecord.role, action: 'USER_LOGIN_FIREBASE', target: normalizedEmail });

  const { password: pass, ...safeUser } = userRecord;
  return { token, user: safeUser };
};

const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase();
  let userRecord = null;

  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) userRecord = userDoc.data();
    } catch (e) {}
  }
  if (!userRecord) userRecord = inMemoryStore.users.get(normalizedEmail);

  if (!userRecord) {
    throw new Error('User Not Found');
  }

  const resetToken = generateToken({ email: userRecord.email, type: 'reset' });
  await sendPasswordResetEmail(email, resetToken);
  return { message: 'Password reset link sent to your email.' };
};

const resetPassword = async (email, token, newPassword) => {
  const passValidation = validatePassword(newPassword);
  if (!passValidation.isValid) {
    throw new Error(passValidation.message);
  }

  const normalizedEmail = email.toLowerCase();
  let userRecord = null;

  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) userRecord = userDoc.data();
    } catch (e) {}
  }
  if (!userRecord) userRecord = inMemoryStore.users.get(normalizedEmail);

  if (!userRecord) {
    throw new Error('User Not Found');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  userRecord.password = hashedPassword;

  if (db) {
    try {
      await db.collection('users').doc(normalizedEmail).update({ password: hashedPassword, updatedAt: new Date().toISOString() });
      console.log(`[Firebase Firestore] Password updated for: ${normalizedEmail}`);
    } catch (e) {}
  }
  inMemoryStore.users.set(normalizedEmail, userRecord);

  await logAction({ userId: userRecord.uid, userName: userRecord.fullName, role: userRecord.role, action: 'USER_PASSWORD_RESET_FIREBASE', target: normalizedEmail });
  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
