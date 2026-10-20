import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import AccountDetails from './pages/AccountDetails/AccountDetails'
import Dashboard from './pages/Dashboard/Dashboard'
import NewECG from './pages/NewECG/NewECG'
import ECGSettings from './pages/ECGSettings/ECGSettings'
import LeadPlacement from './pages/LeadPlacement/LeadPlacement'
import ImageAdjustments from './pages/ImageAdjustments/ImageAdjustments'
import PatientDetails from './pages/PatientDetails/PatientDetails'
import ECGViewer from './pages/ECGViewer/ECGViewer'
import Report from './pages/Report/Report'
import PaymentPlans from './pages/PaymentPlans/PaymentPlans'
import Feedback from './pages/Feedback/Feedback'
import UploadECG from './pages/UploadECG/UploadECG'
import NotFound from './pages/NotFound/NotFound'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account-details" element={<AccountDetails />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/new-ecg" element={<ProtectedRoute><NewECG /></ProtectedRoute>} />
      <Route path="/ecg-settings" element={<ProtectedRoute><ECGSettings /></ProtectedRoute>} />
      <Route path="/lead-placement" element={<ProtectedRoute><LeadPlacement /></ProtectedRoute>} />
      <Route path="/image-adjustments" element={<ProtectedRoute><ImageAdjustments /></ProtectedRoute>} />
      <Route path="/patient-details" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
      <Route path="/ecg-viewer" element={<ProtectedRoute><ECGViewer /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/report/:examId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><PaymentPlans /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadECG /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
