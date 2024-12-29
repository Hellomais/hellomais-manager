import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import RoomsList from './pages/Rooms/List';
import RoomForm from './pages/Rooms/Form';
import RoomAdministration from './pages/Rooms/Administration';
import BannersList from './pages/Banners/index';
import BannerForm from './pages/Banners/form';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <EventProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<RoomsList />} />
            <Route path="rooms/new" element={<RoomForm />} />
            <Route path="rooms/:id/edit" element={<RoomForm />} />
            <Route path="rooms/:id/administration" element={<RoomAdministration />} />
            
            {/* Banners Routes */}
            <Route path="banners" element={<BannersList />} />
            <Route path="banners/new" element={<BannerForm />} />
            <Route path="banners/:id/edit" element={<BannerForm />} />

          </Route>
        </Routes>
      </Router>
    </EventProvider>
  );
}