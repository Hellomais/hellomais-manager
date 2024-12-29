import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EventProvider } from './contexts/EventContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import RoomsList from './pages/Rooms/List';
import RoomForm from './pages/Rooms/Form';

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
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="users" element={<Users />} />
            <Route path="rooms" element={<RoomsList />} />
            <Route path="rooms/new" element={<RoomForm />} />
            <Route path="rooms/:id/edit" element={<RoomForm />} />
          </Route>
        </Routes>
      </Router>
    </EventProvider>
  );
}