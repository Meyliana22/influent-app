import CampaignList from './pages/Campaign/CampaignList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentPage from './pages/Student/StudentPage';
import CampaignCreate from './pages/Campaign/CampaignCreate';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UserPage from './pages/User/UserPage';
import ApplicationsPage from './pages/Applications/ApplicationsPage';
import ReviewPage from './pages/Review/ReviewPage';
import ChatIcon from './assets/chat.svg';
import NotifIcon from './assets/notification.svg';
import ProfileIcon from './assets/profile.svg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Top Navigation Bar */}
        <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '80px', background: '#0d061f', boxShadow: '0 2px 8px #e3e3e3', borderBottom: 'none' }}>
          {/* Logo and Brand */}
          <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo_influent.png" alt="Influent Logo" style={{ height: '32px', marginLeft: '4px' }} />
          </div>
          {/* Centered Links */}
          <div className="navbar-links" style={{ display: 'flex', gap: '48px', fontSize: '1.15rem', fontWeight: '500', flex: 1, justifyContent: 'center' }}>
            <a href="/" className="nav-link" style={{ color: '#222', background: 'white', borderRadius: '18px', padding: '8px 32px', fontWeight: 'bold', textDecoration: 'none' }}>Dashboard</a>
            <a href="/campaign" className="nav-link" style={{ color: '#fff', background: 'transparent', borderRadius: '18px', padding: '8px 32px', fontWeight: 'bold', textDecoration: 'none' }}>Explore</a>
          </div>
          {/* Right Icons */}
          <div className="navbar-icons" style={{ display: 'flex', gap: '24px', fontSize: '1.7rem', alignItems: 'center' }}>
            <img src={ChatIcon} alt="Chat" className="icon chat" title="Chat" style={{ cursor: 'pointer', height: '28px', width: '28px', objectFit: 'contain' }} />
            <img src={NotifIcon} alt="Notifications" className="icon bell" title="Notifications" style={{ cursor: 'pointer', height: '24px', width: '24px', objectFit: 'contain' }} />
            <img src={ProfileIcon} alt="Profile" className="icon user" title="Profile" style={{ cursor: 'pointer', height: '28px', width: '28px', objectFit: 'contain' }} />
          </div>
        </nav>

        {/* Routing for pages */}
        <Routes>
          <Route path="/student" element={<StudentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/campaign-create" element={<CampaignCreate />} />
          <Route path="/campaign-edit/:id" element={<CampaignCreate />} />
          <Route path="/" element={<CampaignList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
