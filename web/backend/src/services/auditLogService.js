const { db, inMemoryStore } = require('../config/firebaseAdmin');

const logAction = async ({ userId, userName, role, action, target, details, ip }) => {
  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: userId || 'system',
    userName: userName || 'System User',
    role: role || 'Administrator',
    action,
    target: target || 'N/A',
    details: details || '',
    ip: ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('auditLogs').doc(logEntry.id).set(logEntry);
    } else {
      inMemoryStore.auditLogs.set(logEntry.id, logEntry);
    }
  } catch (error) {
    console.warn('Audit Logging Warning:', error.message);
    inMemoryStore.auditLogs.set(logEntry.id, logEntry);
  }

  return logEntry;
};

const getLogs = async (limitCount = 50) => {
  try {
    if (db) {
      const snapshot = await db.collection('auditLogs').orderBy('timestamp', 'desc').limit(limitCount).get();
      return snapshot.docs.map(doc => doc.data());
    }
  } catch (e) {
    console.warn('Fallback to in-memory audit logs');
  }
  return Array.from(inMemoryStore.auditLogs.values()).reverse().slice(0, limitCount);
};

module.exports = {
  logAction,
  getLogs
};
