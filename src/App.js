import CampaignList from './pages/Campaign/CampaignList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import CampaignCreate from './pages/Campaign/CampaignCreate';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UserPage from './pages/User/UserPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import ChatIcon from './assets/chat.svg';
import NotifIcon from './assets/notification.svg';
import ProfileIcon from './assets/profile.svg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Routing for pages - Each page has its own Navbar component */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaign-create" element={<CampaignCreate />} />
          <Route path="/campaign-edit/:id" element={<CampaignCreate />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
