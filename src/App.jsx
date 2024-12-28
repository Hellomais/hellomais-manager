import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import RoomForm from './pages/RoomForm';

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
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }>
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="rooms/new" element={<RoomForm />} />
            <Route path="rooms/:id/edit" element={<RoomForm />} />
          </Route>
        </Routes>
      </Router>
    </EventProvider>
  );
}