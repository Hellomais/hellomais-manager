import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UsersPage from './pages/UsersPage';
import RoomsPage from './pages/RoomsPage';
import SchedulePage from './pages/SchedulePage';
import MessageWallPage from './pages/MessageWallPage';
import BannersPage from './pages/BannersPage';
import InstagramPage from './pages/InstagramPage';
import { User, Event } from './types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });

  const handleLogin = (accessToken: string, userData: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.events.length > 0) {
      localStorage.setItem('selectedEvent', JSON.stringify(userData.events[0]));
      setSelectedEvent(userData.events[0]);
    }
    setToken(accessToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedEvent');
    setToken(null);
    setUser(null);
    setSelectedEvent(null);
  };

  const handleEventChange = (event: Event) => {
    localStorage.setItem('selectedEvent', JSON.stringify(event));
    setSelectedEvent(event);
  };

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = user.email === 'gabriel@manager.com' || user.email === 'caiorib.jesus@gmail.com';

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={
            <Dashboard 
              token={token}
              user={user}
              selectedEvent={selectedEvent}
              onEventChange={handleEventChange}
              onLogout={handleLogout}
            />
          } />
          {isAdmin && (
            <>
              <Route path="users" element={<UsersPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="message-wall" element={<MessageWallPage />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="instagram" element={<InstagramPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;