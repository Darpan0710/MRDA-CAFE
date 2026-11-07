import React, { useState, useEffect } from 'react';
import { adminAuth, AdminUser, adminApi } from '../../services/adminApi';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { ReservationManagement } from './ReservationManagement';
import { AvailabilityManagement } from './AvailabilityManagement';
import { MenuManagement } from './MenuManagement';
import { EventsManagement } from './EventsManagement';
import { AdminSettings } from './AdminSettings';

interface AdminAreaProps {
  onReturnToSite: () => void;
  initialTab?: AdminTab;
}

export const AdminArea: React.FC<AdminAreaProps> = ({
  onReturnToSite,
  initialTab = 'dashboard',
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(adminAuth.getUser());
  const [currentTab, setCurrentTab] = useState<AdminTab>(initialTab);
  const [validatingSession, setValidatingSession] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (adminAuth.isAuthenticated()) {
        try {
          const res = await adminApi.getMe();
          setCurrentUser(res.user);
        } catch {
          adminAuth.clearToken();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setValidatingSession(false);
    };

    checkSession();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('mrda:admin:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mrda:admin:unauthorized', handleUnauthorized);
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (validatingSession) {
    return (
      <div className="min-h-screen w-full bg-[#F1E9DC] flex items-center justify-center font-editorial-sans text-xs font-mono text-[#70452D] uppercase tracking-widest">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onReturnToSite={onReturnToSite}
      />
    );
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      currentUser={currentUser}
      onLogout={handleLogout}
      onReturnToSite={onReturnToSite}
    >
      {currentTab === 'dashboard' && (
        <AdminDashboard onNavigateTab={setCurrentTab} />
      )}
      {currentTab === 'reservations' && <ReservationManagement />}
      {currentTab === 'availability' && <AvailabilityManagement />}
      {currentTab === 'menu' && <MenuManagement />}
      {currentTab === 'events' && <EventsManagement />}
      {currentTab === 'settings' && (
        <AdminSettings onProfileUpdated={(updated) => setCurrentUser(updated)} />
      )}
    </AdminLayout>
  );
};
