import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { VerifyOTPPage } from '../pages/auth/VerifyOTPPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Main Dashboard
import { OrthodontistDashboard } from '../pages/dashboard/OrthodontistDashboard';

// Patient Module
import { PatientListPage } from '../pages/patient/PatientListPage';
import { AddPatientPage } from '../pages/patient/AddPatientPage';
import { EditPatientPage } from '../pages/patient/EditPatientPage';
import { PatientDetailsPage } from '../pages/patient/PatientDetailsPage';
import { GrowthAssessmentPage } from '../pages/patient/GrowthAssessmentPage';

// AI Pages
import { XRayUploadPage } from '../pages/ai/XRayUploadPage';
import { LandmarkDetectionPage } from '../pages/ai/LandmarkDetectionPage';
import { CephalometricAnalysisPage } from '../pages/ai/CephalometricAnalysisPage';
import { PredictionResultsPage } from '../pages/ai/PredictionResultsPage';
import { SHAPExplanationPage } from '../pages/ai/SHAPExplanationPage';
import { Craniofacial3DPage } from '../pages/ai/Craniofacial3DPage';
import { AIChatPage } from '../pages/ai/AIChatPage';

// Reports
import { ReportsListPage } from '../pages/reports/ReportsListPage';
import { GenerateReportPage } from '../pages/reports/GenerateReportPage';

// Settings
import { ProfilePage } from '../pages/settings/ProfilePage';
import { NotificationsPage } from '../pages/settings/NotificationsPage';
import { SecurityPage } from '../pages/settings/SecurityPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<OrthodontistDashboard />} />
          <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/researcher/dashboard" element={<Navigate to="/dashboard" replace />} />

          {/* Patients */}
          <Route path="/patients" element={<PatientListPage />} />
          <Route path="/patients/add" element={<AddPatientPage />} />
          <Route path="/patients/edit/:id" element={<EditPatientPage />} />
          <Route path="/patients/:id" element={<PatientDetailsPage />} />
          <Route path="/patients/:id/growth" element={<GrowthAssessmentPage />} />

          {/* AI Workflows */}
          <Route path="/ai/xray-upload" element={<XRayUploadPage />} />
          <Route path="/ai/landmark-detection" element={<LandmarkDetectionPage />} />
          <Route path="/ai/cephalometric-analysis" element={<CephalometricAnalysisPage />} />
          <Route path="/ai/prediction-results" element={<PredictionResultsPage />} />
          <Route path="/ai/shap-explanation" element={<SHAPExplanationPage />} />
          <Route path="/ai/3d-visualization" element={<Craniofacial3DPage />} />
          <Route path="/ai/chat" element={<AIChatPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsListPage />} />
          <Route path="/reports/generate" element={<GenerateReportPage />} />

          {/* Settings */}
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />
          <Route path="/settings/security" element={<SecurityPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
