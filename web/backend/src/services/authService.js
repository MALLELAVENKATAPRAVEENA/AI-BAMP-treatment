const bcrypt = require('bcryptjs');
const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { validatePassword } = require('../utils/passwordValidator');
const { generateToken } = require('../config/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('./emailService');
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
  const uid = `user-${Date.now()}`;

  const newUserObj = {
    uid,
    name: fullName,
    fullName,
    email: normalizedEmail,
    mobileNumber: mobileNumber || '',
    hospitalName: hospitalName || '',
    role: role || 'Orthodontist',
    photoURL: null,
    password: hashedPassword,
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  // 2. Save directly into Firebase Firestore 'users' collection
  if (db) {
    try {
      await db.collection('users').doc(normalizedEmail).set(newUserObj);
      await db.collection('users').doc(uid).set(newUserObj);
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
    throw new Error('User Account Not Found');
  }

  const isMatch = await bcrypt.compare(password, userRecord.password);
  if (!isMatch) {
    throw new Error('Invalid Password');
  }

  const lastLogin = new Date().toISOString();
  userRecord.lastLogin = lastLogin;
  userRecord.lastLoginAt = lastLogin;

  // 2. Update lastLogin in Firebase Firestore
  if (db) {
    try {
      await db.collection('users').doc(normalizedEmail).update({ lastLogin, lastLoginAt: lastLogin });
      console.log(`[Firebase Firestore] Updated lastLogin for: ${normalizedEmail}`);
    } catch (e) {
      console.warn('[Firestore] Login timestamp update fallback:', e.message);
    }
  }
  inMemoryStore.users.set(normalizedEmail, userRecord);

  const token = generateToken({
    uid: userRecord.uid,
    email: userRecord.email,
    role: userRecord.role,
    fullName: userRecord.fullName || userRecord.name
  });

  await logAction({ userId: userRecord.uid, userName: userRecord.fullName || userRecord.name, role: userRecord.role, action: 'USER_LOGIN_FIREBASE', target: normalizedEmail });

  const { password: pass, ...safeUser } = userRecord;
  return { token, user: safeUser };
};

const googleLogin = async (googleUserData) => {
  const { uid, email, displayName, photoURL } = googleUserData;
  if (!email) throw new Error('Google account email is required');

  const normalizedEmail = email.toLowerCase();
  let userRecord = null;

  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) {
        userRecord = userDoc.data();
      }
    } catch (e) {
      console.warn('[Firestore] Google login lookup warning:', e.message);
    }
  }

  if (!userRecord) {
    userRecord = inMemoryStore.users.get(normalizedEmail);
  }

  const now = new Date().toISOString();

  if (!userRecord) {
    // New User: Create record automatically in Firebase Firestore
    userRecord = {
      uid: uid || `google-${Date.now()}`,
      name: displayName || 'Orthodontist Practitioner',
      fullName: displayName || 'Orthodontist Practitioner',
      email: normalizedEmail,
      photoURL: photoURL || null,
      role: 'Orthodontist',
      isVerified: true,
      isActive: true,
      authProvider: 'google',
      createdAt: now,
      lastLogin: now,
      lastLoginAt: now
    };

    if (db) {
      try {
        await db.collection('users').doc(normalizedEmail).set(userRecord);
        await db.collection('users').doc(userRecord.uid).set(userRecord);
        console.log(`[Firebase Firestore] Created new Google Auth user: ${normalizedEmail}`);
      } catch (e) {
        console.warn('[Firestore] Google user save warning:', e.message);
      }
    }
    inMemoryStore.users.set(normalizedEmail, userRecord);
  } else {
    // Existing User: Update last login timestamp
    userRecord.lastLogin = now;
    userRecord.lastLoginAt = now;
    if (photoURL) userRecord.photoURL = photoURL;

    if (db) {
      try {
        await db.collection('users').doc(normalizedEmail).update({
          lastLogin: now,
          lastLoginAt: now,
          ...(photoURL ? { photoURL } : {})
        });
      } catch (e) {}
    }
    inMemoryStore.users.set(normalizedEmail, userRecord);
  }

  const token = generateToken({
    uid: userRecord.uid,
    email: userRecord.email,
    role: userRecord.role || 'Orthodontist',
    fullName: userRecord.fullName || userRecord.name
  });

  await logAction({
    userId: userRecord.uid,
    userName: userRecord.fullName || userRecord.name,
    role: userRecord.role || 'Orthodontist',
    action: 'USER_GOOGLE_LOGIN_FIREBASE',
    target: normalizedEmail
  });

  const { password: pass, ...safeUser } = userRecord;
  return { token, user: safeUser, message: 'Google Sign-In Successful' };
};

// In-Memory OTP Store Fallback
const otpStore = new Map();

const requestPasswordReset = async (email) => {
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
    throw new Error('User Account Not Found');
  }

  // Generate secure 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = new Date().toISOString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 Minutes validity

  const otpRecord = {
    email: normalizedEmail,
    otpCode,
    createdAt,
    expiresAt,
    used: false
  };

  // Save to Firestore 'password_reset_otps' collection
  if (db) {
    try {
      await db.collection('password_reset_otps').doc(normalizedEmail).set(otpRecord);
      console.log(`[Firestore] Secure OTP saved in 'password_reset_otps' for: ${normalizedEmail}`);
    } catch (e) {
      console.warn('[Firestore] OTP save fallback:', e.message);
    }
  }
  otpStore.set(normalizedEmail, otpRecord);

  // Send Email with exact template
  await sendPasswordResetEmail(normalizedEmail, otpCode);

  await logAction({
    userId: userRecord.uid || 'system',
    userName: userRecord.fullName || userRecord.name || 'User',
    role: userRecord.role || 'Orthodontist',
    action: 'PASSWORD_RESET_OTP_REQUESTED',
    target: normalizedEmail
  });

  // Do NOT return OTP in response body
  return {
    success: true,
    message: 'Password reset verification code sent to your registered email address.'
  };
};

const verifyPasswordResetOtp = async (email, otpCode) => {
  const normalizedEmail = email.toLowerCase();
  let record = null;

  if (db) {
    try {
      const doc = await db.collection('password_reset_otps').doc(normalizedEmail).get();
      if (doc.exists) record = doc.data();
    } catch (e) {}
  }
  if (!record) record = otpStore.get(normalizedEmail);

  if (!record || record.used) {
    throw new Error('Invalid OTP');
  }

  if (Date.now() > record.expiresAt) {
    throw new Error('OTP expired. Request a new OTP.');
  }

  if (record.otpCode !== otpCode) {
    throw new Error('Invalid OTP');
  }

  return {
    valid: true,
    message: 'OTP verified successfully.'
  };
};

const confirmPasswordReset = async (email, otpCode, newPassword) => {
  const normalizedEmail = email.toLowerCase();

  // 1. Verify OTP validity
  await verifyPasswordResetOtp(normalizedEmail, otpCode);

  // 2. Validate New Password
  const passValidation = validatePassword(newPassword);
  if (!passValidation.isValid) {
    throw new Error(passValidation.message);
  }

  // 3. Hash New Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 4. Update user record in Firestore 'users'
  let userRecord = null;
  if (db) {
    try {
      const userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) {
        userRecord = userDoc.data();
        await db.collection('users').doc(normalizedEmail).update({
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        });
        if (userRecord.uid) {
          await db.collection('users').doc(userRecord.uid).update({
            password: hashedPassword,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {}
  }

  const memUser = inMemoryStore.users.get(normalizedEmail);
  if (memUser) {
    memUser.password = hashedPassword;
    inMemoryStore.users.set(normalizedEmail, memUser);
  }

  // 5. Mark OTP as used
  const usedAt = new Date().toISOString();
  if (db) {
    try {
      await db.collection('password_reset_otps').doc(normalizedEmail).update({
        used: true,
        usedAt
      });
    } catch (e) {}
  }

  const memOtp = otpStore.get(normalizedEmail);
  if (memOtp) {
    memOtp.used = true;
    memOtp.usedAt = usedAt;
  }

  await logAction({
    userId: userRecord?.uid || 'user',
    userName: userRecord?.fullName || userRecord?.name || 'User',
    role: userRecord?.role || 'Orthodontist',
    action: 'PASSWORD_RESET_COMPLETED',
    target: normalizedEmail
  });

  return {
    success: true,
    message: 'Password updated successfully. Please sign in with your new password.'
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword: requestPasswordReset,
  requestPasswordReset,
  verifyPasswordResetOtp,
  confirmPasswordReset
};
