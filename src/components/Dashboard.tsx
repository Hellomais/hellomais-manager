import React, { useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { User, Event } from '../types';
import { useUserMetrics } from '../hooks/useUserMetrics';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useEventMetrics } from '../hooks/useEventMetrics';
import AccessDetailsModal from './AccessDetailsModal';
import TotalUsersCard from './metrics/TotalUsersCard';
import UsersWithAccessCard from './metrics/UsersWithAccessCard';
import AccessRateCard from './metrics/AccessRateCard';
import OnlineUsersCard from './metrics/OnlineUsersCard';
import FirstAccessTimeline from './metrics/FirstAccessTimeline';
import ReactionTimeline from './metrics/ReactionTimeline';
import UserReactionsTable from './metrics/UserReactionsTable';
import UserMessagesTable from './metrics/UserMessagesTable';

interface DashboardProps {
  token: string;
  user: User;
  selectedEvent: Event | null;
  onEventChange: (event: Event) => void;
  onLogout: () => void;
}

function Dashboard({ token, user, selectedEvent, onEventChange, onLogout }: DashboardProps) {
  const [isAccessDetailsModalOpen, setIsAccessDetailsModalOpen] = useState(false);
  const { totalUsers, usersWithAccess, accessRate, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUserMetrics(token, selectedEvent?.id ?? null);
  const { currentOnline, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboardMetrics(token, selectedEvent?.id ?? null);
  const { 
    firstAccesses,
    userReactions,
    userMessages,
    reactionTimeline,
    loading: eventMetricsLoading,
    error: eventMetricsError,
    refresh: refreshEventMetrics
  } = useEventMetrics(token, selectedEvent?.id ?? null);

  const handleRefresh = () => {
    refreshUsers();
    refreshDashboard();
    refreshEventMetrics();
  };

  // Group first accesses by hour
  const firstAccessesByHour = React.useMemo(() => {
    const grouped = new Map<string, number>();
    firstAccesses.forEach(access => {
      const hour = new Date(access.timestamp).toISOString().slice(0, 13);
      grouped.set(hour, (grouped.get(hour) || 0) + 1);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({
        hour: new Date(hour).toLocaleString('pt-BR', { 
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit'
        }),
        count
      }));
  }, [firstAccesses]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard de Métricas</h1>
              <select
                value={selectedEvent?.id}
                onChange={(e) => {
                  const event = user.events.find(evt => evt.id === Number(e.target.value));
                  if (event) onEventChange(event);
                }}
                className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {user.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={usersLoading || dashboardLoading || eventMetricsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(usersLoading || dashboardLoading || eventMetricsLoading) ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name}</span>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedEvent ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <TotalUsersCard
                total={totalUsers}
                loading={usersLoading}
                error={usersError}
              />
              <UsersWithAccessCard
                total={usersWithAccess}
                loading={usersLoading}
                error={usersError}
                onShowDetails={() => setIsAccessDetailsModalOpen(true)}
              />
              <AccessRateCard
                rate={accessRate}
                loading={usersLoading}
                error={usersError}
              />
              <OnlineUsersCard
                total={currentOnline}
                loading={dashboardLoading}
                error={dashboardError}
              />
            </div>

            {/* Charts and Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FirstAccessTimeline
                data={firstAccessesByHour}
                loading={eventMetricsLoading}
                error={eventMetricsError}
              />
              <ReactionTimeline
                data={reactionTimeline}
                loading={eventMetricsLoading}
                error={eventMetricsError}
              />
              <UserReactionsTable
                data={userReactions}
                loading={eventMetricsLoading}
                error={eventMetricsError}
              />
              <UserMessagesTable
                data={userMessages}
                loading={eventMetricsLoading}
                error={eventMetricsError}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg">Selecione um evento para visualizar as métricas</p>
          </div>
        )}
      </main>

      <AccessDetailsModal
        isOpen={isAccessDetailsModalOpen}
        onClose={() => setIsAccessDetailsModalOpen(false)}
        token={token}
        eventId={selectedEvent?.id ?? null}
      />
    </div>
  );
}

export default Dashboard;