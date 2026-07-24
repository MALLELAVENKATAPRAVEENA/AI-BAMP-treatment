const bcrypt = require('bcryptjs');
const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { getLogs, createAuditLog } = require('../services/auditLogService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getUserProfile = async (req, res, next) => {
  try {
    const email = (req.user?.email || '').toLowerCase();
    const uid = req.user?.uid || req.user?.id;

    let userRecord = null;
    if (db) {
      try {
        const doc = await db.collection('users').doc(email || uid).get();
        if (doc.exists) userRecord = doc.data();
      } catch (e) {
        console.warn('[Firestore] getUserProfile error:', e.message);
      }
    }

    if (!userRecord) {
      userRecord = inMemoryStore.users.get(email) || req.user;
    }

    if (userRecord) {
      const { password, ...safe } = userRecord;
      return sendSuccess(res, 'User profile retrieved successfully', safe);
    }
    return sendError(res, 'User record not found', 404);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, hospitalName, password, avatarUrl } = req.body;
    const targetEmail = (req.user?.email || '').toLowerCase();

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (fullName) updates.fullName = fullName;
    if (mobileNumber) updates.mobileNumber = mobileNumber;
    if (hospitalName) updates.hospitalName = hospitalName;
    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (db && targetEmail) {
      try {
        await db.collection('users').doc(targetEmail).set(updates, { merge: true });
      } catch (e) {
        console.warn('[Firestore] Update profile error:', e.message);
      }
    }

    const existing = inMemoryStore.users.get(targetEmail) || {};
    const updatedUser = { ...existing, ...updates, email: targetEmail };
    inMemoryStore.users.set(targetEmail, updatedUser);

    const { password: pwd, ...safeUser } = updatedUser;
    await createAuditLog('USER_PROFILE_UPDATED', req.user?.uid || 'user', { targetEmail });

    return sendSuccess(res, 'Practitioner profile updated successfully in Firestore', safeUser);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const clearDemoData = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;

    if (db) {
      try {
        const collections = ['patients', 'predictions', 'xrays', 'reports', 'landmarks', 'cephalometricMeasurements'];
        for (const col of collections) {
          const snapshot = await db.collection(col).get();
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      } catch (e) {
        console.warn('[Firestore] Clear demo data batch error:', e.message);
      }
    }

    inMemoryStore.patients.clear();
    inMemoryStore.predictions.clear();
    inMemoryStore.xrays.clear();
    inMemoryStore.reports.clear();
    inMemoryStore.landmarks.clear();
    inMemoryStore.cephalometricMeasurements.clear();

    await createAuditLog('DEMO_DATA_CLEARED', doctorId || 'admin', { timestamp: new Date().toISOString() });

    return sendSuccess(res, 'All demo/sample data wiped clean from Firebase & memory store');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUsers = async (req, res, next) => {
  try {
    let usersList = [];
    if (db) {
      try {
        const snapshot = await db.collection('users').get();
        if (!snapshot.empty) {
          usersList = snapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password;
            return data;
          });
        }
      } catch (e) {
        console.warn('[Firestore] getUsers fallback:', e.message);
      }
    }
    if (usersList.length === 0) {
      usersList = Array.from(inMemoryStore.users.values()).map(u => {
        const { password, ...safe } = u;
        return safe;
      });
    }
    return sendSuccess(res, 'Users fetched successfully', usersList);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (db) {
      try {
        await db.collection('users').doc(normalizedEmail).update({ role });
      } catch (e) {}
    }
    const user = inMemoryStore.users.get(normalizedEmail);
    if (user) {
      user.role = role;
      inMemoryStore.users.set(normalizedEmail, user);
    }
    return sendSuccess(res, 'User role updated successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const fetchAuditLogs = async (req, res, next) => {
  try {
    const logs = await getLogs(100);
    return sendSuccess(res, 'Audit logs retrieved', logs);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  clearDemoData,
  getUsers,
  updateUserRole,
  fetchAuditLogs
};
