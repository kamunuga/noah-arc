import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAuth, RequireRole } from './components/Guards';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import CreativeProfile from './pages/CreativeProfile';
import JobBoard from './pages/JobBoard';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import MyPortfolio from './pages/MyPortfolio';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/creatives/:id" element={<CreativeProfile />} />
        <Route path="/jobs" element={<JobBoard />} />

        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />

        <Route path="/my-portfolio" element={<RequireRole role="creative"><MyPortfolio /></RequireRole>} />
        <Route path="/my-applications" element={<RequireRole role="creative"><MyApplications /></RequireRole>} />

        <Route path="/post-job" element={<RequireRole role="client"><PostJob /></RequireRole>} />
        <Route path="/my-jobs" element={<RequireRole role="client"><MyJobs /></RequireRole>} />

        <Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
