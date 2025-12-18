import CampaignList from './pages/Campaign/CampaignList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import CampaignCreate from './pages/Campaign/CampaignCreate';
import ViewApplicants from './pages/Campaign/ViewApplicants';
import SelectApplicants from './pages/Campaign/SelectApplicants';
import PaymentConfirmation from './pages/Campaign/PaymentConfirmation';
import PaymentSuccess from './pages/Campaign/PaymentSuccess';
import CampaignDetail from './pages/Campaign/CampaignDetail';
import ReviewSubmissions from './pages/Campaign/ReviewSubmissions';
import CampaignReport from './pages/Campaign/CampaignReport';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UserPage from './pages/User/UserPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageCampaigns from './pages/Admin/ManageCampaigns';
import AdminTransactions from './pages/Admin/AdminTransactions';
import ManageWithdrawals from './pages/Admin/ManageWithdrawals';
import Reports from './pages/Admin/Reports';
import AdminReviewSubmissions from './pages/Admin/AdminReviewSubmissions';
import UMKMDashboard from './pages/UMKM/UMKMDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import BrowseCampaigns from './pages/Student/BrowseCampaigns';
import MyApplications from './pages/Student/MyApplications';
import Collaborations from './pages/Student/Collaborations';
import Transactions from './pages/Student/Transactions';
import CampaignWorkPage from './pages/Student/CampaignWorkPage';
import StudentProfile from './pages/Student/StudentProfile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

function App() {
  const oneSignalInitialized = useRef(false);

  useEffect(() => {
    // Only initialize OneSignal once
    if (!oneSignalInitialized.current) {
      oneSignalInitialized.current = true;
      
      OneSignal.init({
        appId: "447bc07a-a7fe-47b4-ab49-d0dd0f69ac52",
        safari_web_id: "web.onesignal.auto.6b31cc7e-8212-45ce-95eb-ed8c35d3e69c",
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
      }).catch(err => {
        console.log('OneSignal initialization error:', err);
      });
    }
  }, []);
  
  return (
    <Router>
      <div className="app-container">
        {/* Toast Container for global notifications */}
        <ToastContainer />
        {/* Routing for pages - Each page has its own Navbar component */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:role" element={<RegisterPage />} />
          <Route path="/register-umkm" element={<RegisterPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/user" element={<UserPage />} />

          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaign-create" element={<CampaignCreate />} />
          <Route path="/campaign-edit/:id" element={<CampaignCreate />} />
          <Route path="/campaign/:id/payment" element={<PaymentConfirmation />} />
          <Route path="/campaign/:id/payment-success" element={<PaymentSuccess />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/campaign/:campaignId/applicants" element={<ViewApplicants />} />
          <Route path="/campaign/:campaignId/select-applicants" element={<SelectApplicants />} />
          <Route path="/campaign/:campaignId/review-submissions" element={<ReviewSubmissions />} />
          <Route path="/campaign/:campaignId/report" element={<CampaignReport />} />
          <Route path="/campaign/:id/detail" element={<CampaignCreate />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/campaigns" element={<ManageCampaigns />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/withdrawals" element={<ManageWithdrawals />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/review-submissions" element={<AdminReviewSubmissions />} />
          
          {/* UMKM Routes */}
          <Route path="/umkm/dashboard" element={<UMKMDashboard />} />
          <Route path="/umkm/campaigns" element={<CampaignList />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/browse-campaigns" element={<BrowseCampaigns />} />
          <Route path="/student/my-applications" element={<MyApplications />} />
          <Route path="/student/campaign/:id/work" element={<CampaignWorkPage />} />


          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/collaborations" element={<Collaborations />} />
          <Route path="/student/transactions" element={<Transactions />} />
          
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
