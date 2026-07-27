const bcrypt = require('bcryptjs');
const { db, auth, inMemoryStore } = require('../config/firebaseAdmin');
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

  // 2. Create User in Firebase Authentication Cloud (bamp-1de96)
  if (auth) {
    try {
      await auth.createUser({
        uid,
        email: normalizedEmail,
        password: password,
        displayName: fullName
      });
      console.log(`[Firebase Auth Cloud] User created in Auth SDK: ${normalizedEmail}`);
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-exists') {
        try {
          const userRec = await auth.getUserByEmail(normalizedEmail);
          await auth.updateUser(userRec.uid, { password: password });
        } catch (_) {}
      }
    }
  }

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

  // 3. Save directly into Firebase Firestore 'users' collection
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

  // 1. Query Firebase Firestore 'users' collection first by doc ID and by email field
  if (db) {
    try {
      let userDoc = await db.collection('users').doc(normalizedEmail).get();
      if (userDoc.exists) {
        userRecord = userDoc.data();
      } else {
        const querySnap = await db.collection('users').where('email', '==', normalizedEmail).get();
        if (!querySnap.empty) {
          userRecord = querySnap.docs[0].data();
        }
      }
    } catch (e) {
      console.warn('[Firestore] Login lookup fallback:', e.message);
    }
  }

  if (!userRecord) {
    userRecord = inMemoryStore.users.get(normalizedEmail);
  }

  // 2. Fallback check on Firebase Auth Cloud SDK
  if (!userRecord && auth) {
    try {
      const authUser = await auth.getUserByEmail(normalizedEmail);
      if (authUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        userRecord = {
          uid: authUser.uid,
          email: authUser.email.toLowerCase(),
          fullName: authUser.displayName || 'Orthodontist Practitioner',
          name: authUser.displayName || 'Orthodontist Practitioner',
          role: 'Orthodontist',
          password: hashedPassword,
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        if (db) {
          await db.collection('users').doc(normalizedEmail).set(userRecord);
          await db.collection('users').doc(authUser.uid).set(userRecord);
        }
        inMemoryStore.users.set(normalizedEmail, userRecord);
      }
    } catch (authErr) {
      console.warn('[Firebase Auth] User lookup fallback check:', authErr.message);
    }
  }

  if (!userRecord) {
    throw new Error('User Account Not Found');
  }

  const isMatch = await bcrypt.compare(password, userRecord.password);
  if (!isMatch) {
    // If password mismatch, sync password to userRecord if coming from Firebase Auth
    const isMatchRaw = (password === userRecord.password);
    if (!isMatchRaw) {
      throw new Error('Invalid Password');
    }
  }

  // Ensure Firebase Auth Cloud account exists with password
  if (auth) {
    try {
      const userRec = await auth.getUserByEmail(normalizedEmail);
      await auth.updateUser(userRec.uid, { password: password });
    } catch (authErr) {
      if (authErr.code === 'auth/user-not-found') {
        try {
          await auth.createUser({
            uid: userRecord.uid || `user-${Date.now()}`,
            email: normalizedEmail,
            password: password,
            displayName: userRecord.fullName || userRecord.name || 'Orthodontist Practitioner'
          });
        } catch (_) {}
      }
    }
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

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = new Date().toISOString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const otpRecord = {
    email: normalizedEmail,
    otpCode,
    createdAt,
    expiresAt,
    used: false
  };

  if (db) {
    try {
      await db.collection('password_reset_otps').doc(normalizedEmail).set(otpRecord);
    } catch (e) {}
  }
  otpStore.set(normalizedEmail, otpRecord);

  await sendPasswordResetEmail(normalizedEmail, otpCode);

  await logAction({
    userId: userRecord.uid || 'system',
    userName: userRecord.fullName || userRecord.name || 'User',
    role: userRecord.role || 'Orthodontist',
    action: 'PASSWORD_RESET_OTP_REQUESTED',
    target: normalizedEmail
  });

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

  await verifyPasswordResetOtp(normalizedEmail, otpCode);

  const passValidation = validatePassword(newPassword);
  if (!passValidation.isValid) {
    throw new Error(passValidation.message);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

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
      }
    } catch (e) {}
  }

  if (auth) {
    try {
      const userRec = await auth.getUserByEmail(normalizedEmail);
      await auth.updateUser(userRec.uid, { password: newPassword });
    } catch (_) {}
  }

  const memUser = inMemoryStore.users.get(normalizedEmail);
  if (memUser) {
    memUser.password = hashedPassword;
    inMemoryStore.users.set(normalizedEmail, memUser);
  }

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
