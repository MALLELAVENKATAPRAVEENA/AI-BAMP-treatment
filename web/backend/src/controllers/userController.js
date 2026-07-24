const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { getLogs } = require('../services/auditLogService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

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

const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, hospitalName } = req.body;
    const targetEmail = (req.user?.email || req.body.email || '').toLowerCase();

    const updates = {
      fullName: fullName || 'Dr. Practitioner',
      mobileNumber: mobileNumber || '+1 555-0199',
      hospitalName: hospitalName || 'St. Jude Orthodontics',
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await db.collection('users').doc(targetEmail).update(updates);
      } catch (e) {
        console.warn('[Firestore] Update profile fallback');
      }
    }

    const user = inMemoryStore.users.get(targetEmail) || {};
    const updatedUser = { ...user, ...updates, email: targetEmail };
    inMemoryStore.users.set(targetEmail, updatedUser);

    const { password, ...safeUser } = updatedUser;
    return sendSuccess(res, 'Practitioner profile updated successfully', safeUser);
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
  getUsers,
  updateUserRole,
  updateUserProfile,
  fetchAuditLogs
};
