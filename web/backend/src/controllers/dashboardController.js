const { db, inMemoryStore } = require('../config/firebaseAdmin');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;

    let patientsList = [];
    let predictionsList = [];
    let xraysList = [];
    let reportsList = [];

    if (db && doctorId) {
      try {
        const pSnap = await db.collection('patients').where('doctorId', '==', doctorId).get();
        patientsList = pSnap.docs.map(doc => doc.data());

        const predSnap = await db.collection('predictions').where('doctorId', '==', doctorId).get();
        predictionsList = predSnap.docs.map(doc => doc.data());

        const xraySnap = await db.collection('xrays').where('doctorId', '==', doctorId).get();
        xraysList = xraySnap.docs.map(doc => doc.data());

        const repSnap = await db.collection('reports').where('doctorId', '==', doctorId).get();
        reportsList = repSnap.docs.map(doc => doc.data());
      } catch (e) {
        console.warn('[Firestore] Dashboard query using in-memory store metrics fallback');
        patientsList = Array.from(inMemoryStore.patients.values()).filter(p => p.doctorId === doctorId);
        predictionsList = Array.from(inMemoryStore.predictions.values()).filter(p => p.doctorId === doctorId);
        xraysList = Array.from(inMemoryStore.xrays.values()).filter(p => p.doctorId === doctorId);
        reportsList = Array.from(inMemoryStore.reports.values()).filter(p => p.doctorId === doctorId);
      }
    } else if (doctorId) {
      patientsList = Array.from(inMemoryStore.patients.values()).filter(p => p.doctorId === doctorId);
      predictionsList = Array.from(inMemoryStore.predictions.values()).filter(p => p.doctorId === doctorId);
      xraysList = Array.from(inMemoryStore.xrays.values()).filter(p => p.doctorId === doctorId);
      reportsList = Array.from(inMemoryStore.reports.values()).filter(p => p.doctorId === doctorId);
    }

    const totalPatients = patientsList.length;
    const totalPredictions = predictionsList.length;
    const totalXrays = xraysList.length;
    const totalReports = reportsList.length;

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
        newPatientsThisMonth: totalPatients,
        predictionCount: totalPredictions,
        successfulCases,
        moderateRiskCases,
        highRiskCases,
        uploadedXrays: totalXrays,
        reportsGenerated: totalReports,
        averageSuccessRate: Number(avgSuccessRate.toFixed(1))
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
