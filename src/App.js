import CampaignList from './pages/Campaign/CampaignList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import CampaignCreate from './pages/Campaign/CampaignCreate';
import ViewApplicants from './pages/Campaign/ViewApplicants';
import SelectApplicants from './pages/Campaign/SelectApplicants';
import PaymentConfirmation from './pages/Campaign/PaymentConfirmation';
import PaymentSuccess from './pages/Campaign/PaymentSuccess';
import CampaignDetail from './pages/Campaign/CampaignDetail';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UserPage from './pages/User/UserPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageCampaigns from './pages/Admin/ManageCampaigns';
import Reports from './pages/Admin/Reports';
import UMKMDashboard from './pages/UMKM/UMKMDashboard';
import StudentDashboard from './pages/Student/StudentDashboard';
import BrowseCampaigns from './pages/Student/BrowseCampaigns';
import Collaborations from './pages/Student/Collaborations';
import Transactions from './pages/Student/Transactions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Toast Container for global notifications */}
        <ToastContainer />
        {/* Routing for pages - Each page has its own Navbar component */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-umkm" element={<LoginPage />} />
          <Route path="/register/:role" element={<RegisterPage />} />
          <Route path="/register-umkm" element={<RegisterPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaign-create" element={<CampaignCreate />} />
          <Route path="/campaign-edit/:id" element={<CampaignCreate />} />
          <Route path="/campaign/:id/payment" element={<PaymentConfirmation />} />
          <Route path="/campaign/:id/payment-success" element={<PaymentSuccess />} />
          <Route path="/campaign/:campaignId/applicants" element={<ViewApplicants />} />
          <Route path="/campaign/:campaignId/select-applicants" element={<SelectApplicants />} />
          <Route path="/campaign/:id/detail" element={<CampaignDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/campaigns" element={<ManageCampaigns />} />
          <Route path="/admin/reports" element={<Reports />} />
          
          {/* UMKM Routes */}
          <Route path="/umkm/dashboard" element={<UMKMDashboard />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/browse-campaigns" element={<BrowseCampaigns />} />
          <Route path="/student/collaborations" element={<Collaborations />} />
          <Route path="/student/transactions" element={<Transactions />} />
          
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
