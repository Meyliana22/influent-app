import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentPage from './pages/Student/StudentPage';
import CampaignPage from './pages/Campaign/CampaignPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import UserPage from './pages/User/UserPage';
import ApplicationsPage from './pages/Applications/ApplicationsPage';
import ReviewPage from './pages/Review/ReviewPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Top Navigation Bar */}
        <nav className="navbar">
          <div className="navbar-logo">Logo</div>
          <div className="navbar-links">
            <span className="nav-link active">Dashboard</span>
            <span className="nav-link">Explore</span>
          </div>
          <div className="navbar-icons">
            <span className="icon chat" title="Chat">💬</span>
            <span className="icon bell" title="Notifications">🔔</span>
            <span className="icon settings" title="Settings">⚙️</span>
          </div>
        </nav>

        {/* Routing for pages */}
        <Routes>
          <Route path="/student" element={<StudentPage />} />
          <Route path="/campaign" element={<CampaignPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/review" element={<ReviewPage />} />
          {/* Default route can be your dashboard or campaign list */}
          <Route path="/" element={<CampaignPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
