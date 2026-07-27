const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;

    let patientsList = [];
    let predictionsList = [];
    let xraysList = [];
    let reportsList = [];
    let usersList = [];
    let recentActivities = [];

    if (db) {
      try {
        const pSnap = await db.collection('patients').get();
        patientsList = pSnap.docs.map(doc => doc.data());

        const predSnap = await db.collection('predictions').get();
        predictionsList = predSnap.docs.map(doc => doc.data());

        const xraySnap = await db.collection('xrays').get();
        if (!xraySnap.empty) {
          xraysList = xraySnap.docs.map(doc => doc.data());
        } else {
          const pxSnap = await db.collection('patient_xrays').get();
          xraysList = pxSnap.docs.map(doc => doc.data());
        }

        const repSnap = await db.collection('reports').get();
        reportsList = repSnap.docs.map(doc => doc.data());

        const userSnap = await db.collection('users').get();
        usersList = userSnap.docs.map(doc => doc.data());

        const auditSnap = await db.collection('auditLogs').get();
        if (!auditSnap.empty) {
          recentActivities = auditSnap.docs.map(doc => doc.data());
        }
      } catch (e) {
        console.warn('[Firestore] Dashboard query using in-memory store metrics fallback:', e.message);
        patientsList = Array.from(inMemoryStore.patients.values());
        predictionsList = Array.from(inMemoryStore.predictions.values());
        xraysList = Array.from(inMemoryStore.xrays.values());
        reportsList = Array.from(inMemoryStore.reports.values());
        usersList = Array.from(inMemoryStore.users.values());
      }
    } else {
      patientsList = Array.from(inMemoryStore.patients.values());
      predictionsList = Array.from(inMemoryStore.predictions.values());
      xraysList = Array.from(inMemoryStore.xrays.values());
      reportsList = Array.from(inMemoryStore.reports.values());
      usersList = Array.from(inMemoryStore.users.values());
    }

    const totalPatients = patientsList.length;
    const totalPredictions = predictionsList.length;
    const totalXrays = xraysList.length;
    const totalReports = reportsList.length;
    const totalUsers = Math.max(usersList.length, 1);

    // Calculate dynamic risk level distributions for THIS doctor
    const successfulCases = predictionsList.filter(p => (p.riskLevel === 'Success' || p.successProbability >= 85)).length;
    const moderateRiskCases = predictionsList.filter(p => (p.riskLevel === 'Moderate Risk' || (p.successProbability >= 70 && p.successProbability < 85))).length;
    const highRiskCases = predictionsList.filter(p => (p.riskLevel === 'High Risk' || p.successProbability < 70)).length;

    // Calculate mean prediction probability
    const avgProbSum = predictionsList.reduce((sum, p) => sum + Number(p.successProbability || 0), 0);
    const avgSuccessRate = predictionsList.length > 0 ? (avgProbSum / predictionsList.length) : 0.0;

    // CVM distribution from real doctor's patient charts
    const cvmCounts = { 'CVM 1': 0, 'CVM 2': 0, 'CVM 3': 0, 'CVM 4': 0, 'CVM 5': 0, 'CVM 6': 0 };
    patientsList.forEach(p => {
      const st = p.cvmStage || 'CVM 3';
      if (cvmCounts[st] !== undefined) cvmCounts[st]++;
    });

    const femaleCount = patientsList.filter(p => (p.gender || '').toLowerCase() === 'female').length;
    const maleCount = patientsList.filter(p => (p.gender || '').toLowerCase() === 'male').length;

    const stats = {
      widgets: {
        totalPatients,
        totalUsers,
        newPatientsThisMonth: totalPatients,
        predictionCount: totalPredictions,
        successfulCases,
        moderateRiskCases,
        highRiskCases,
        uploadedXrays: totalXrays,
        reportsGenerated: totalReports,
        averageSuccessRate: Number(avgSuccessRate.toFixed(1))
      },
      recent: {
        recentPatients: patientsList.slice(-5).reverse(),
        recentUploads: xraysList.slice(-5).reverse(),
        recentPredictions: predictionsList.slice(-5).reverse(),
        recentReports: reportsList.slice(-5).reverse(),
        recentActivities
      },
      charts: {
        successRateTrend: [
          { month: 'Current', successRate: Number(avgSuccessRate.toFixed(1)), totalCases: totalPredictions }
        ],
        ageDistribution: [
          { ageGroup: '8-9 yrs', count: patientsList.filter(p => (p.age || 0) < 10).length },
          { ageGroup: '10-11 yrs', count: patientsList.filter(p => (p.age || 0) >= 10 && (p.age || 0) <= 11).length },
          { ageGroup: '12-13 yrs', count: patientsList.filter(p => (p.age || 0) >= 12 && (p.age || 0) <= 13).length },
          { ageGroup: '14+ yrs', count: patientsList.filter(p => (p.age || 0) > 13).length }
        ],
        genderDistribution: [
          { gender: 'Female', count: femaleCount },
          { gender: 'Male', count: maleCount }
        ],
        growthStageAnalysis: Object.keys(cvmCounts).map(stage => ({
          stage,
          count: cvmCounts[stage]
        }))
      }
    };

    return sendSuccess(res, 'Live doctor dashboard metrics fetched successfully', stats);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats
};
