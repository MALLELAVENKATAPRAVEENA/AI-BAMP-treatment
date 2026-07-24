const { db, inMemoryStore } = require('../config/firebaseAdmin');

const logAction = async ({ userId, userName, role, action, target, details, ip }) => {
  const logId = `log-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const logEntry = {
    logId,
    id: logId,
    userId: userId || 'system',
    userName: userName || 'System User',
    role: role || 'Orthodontist',
    action,
    target: target || 'N/A',
    details: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : (action + ' executed'),
    ip: ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('audit_logs').doc(logId).set(logEntry);
      await db.collection('auditLogs').doc(logId).set(logEntry);
    } else {
      inMemoryStore.auditLogs.set(logId, logEntry);
    }
  } catch (error) {
    console.warn('Audit Logging Warning:', error.message);
    inMemoryStore.auditLogs.set(logId, logEntry);
  }

  return logEntry;
};

const getLogs = async (limitCount = 50) => {
  try {
    if (db) {
      const snapshot = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(limitCount).get();
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      }
    }
  } catch (e) {
    console.warn('Fallback to in-memory audit logs');
  }
  return Array.from(inMemoryStore.auditLogs.values()).reverse().slice(0, limitCount);
};

module.exports = {
  logAction,
  getLogs,
  createAuditLog: logAction
};
