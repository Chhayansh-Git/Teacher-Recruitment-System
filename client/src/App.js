// src/App.js

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegistrationPage } from './pages/auth/RegistrationPage';
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
// Candidate Imports
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import CompleteProfilePage from './pages/candidate/CompleteProfilePage';
// School Imports
import SchoolDashboard from './pages/school/SchoolDashboard';
import SchoolProfilePage from './pages/school/SchoolProfilePage';
import PostRequirementPage from './pages/school/PostRequirementPage';
import ViewRequirementsPage from './pages/school/ViewRequirementsPage';
import RequirementDetailsPage from './pages/school/RequirementDetailsPage';
import EditRequirementPage from './pages/school/EditRequirementPage';
import SchoolCandidatesPage from './pages/school/SchoolCandidatesPage'; // <-- IMPORT NEW PAGE
// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSchoolsPage from './pages/admin/ManageSchoolsPage';
import ManageCandidatesPage from './pages/admin/ManageCandidatesPage';
import ManageRequirementsPage from './pages/admin/ManageRequirementsPage';
import RequirementPushPage from './pages/admin/RequirementPushPage';
import ReportsPage from './pages/admin/ReportsPage';
import ManageEmailTemplatesPage from './pages/admin/ManageEmailTemplatesPage';
import EmailTemplateFormPage from './pages/admin/EmailTemplateFormPage';
import SettingsPage from './pages/admin/SettingsPage';

const queryClient = new QueryClient();

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const userRole = user.role === 'super-admin' ? 'admin' : user.role;
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegistrationPage /></PublicRoute>} />
            <Route path="/otp-verification" element={<PublicRoute><OtpVerificationPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password/:userId/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
            
            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><CandidateDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><CandidateProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><MyApplicationsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><CompleteProfilePage /></DashboardLayout></ProtectedRoute>} />
            
            {/* School Routes */}
            <Route path="/school/dashboard" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><SchoolDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/profile" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><SchoolProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/requirements/new" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><PostRequirementPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/requirements" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><ViewRequirementsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/requirements/:id" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><RequirementDetailsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/requirements/edit/:id" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><EditRequirementPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/school/candidates" element={<ProtectedRoute allowedRoles={['school']}><DashboardLayout><SchoolCandidatesPage /></DashboardLayout></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/schools" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageSchoolsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/candidates" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageCandidatesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/requirements" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageRequirementsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/requirements/:id" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><RequirementPushPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/email-templates" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageEmailTemplatesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/email-templates/new" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><EmailTemplateFormPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/email-templates/edit/:key" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><EmailTemplateFormPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
            
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;