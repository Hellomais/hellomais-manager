import React, { useState } from 'react';
import { Search, Upload, UserPlus } from 'lucide-react';
import EventSelector from '../components/EventSelector';
import UserTable from '../components/users/UserTable';
import ImportUsersModal from '../components/users/ImportUsersModal';
import CreateUserModal from '../components/users/CreateUserModal';
import { Event } from '../types';
import { useUserAccesses } from '../hooks/useUserAccesses';

function UsersPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const token = localStorage.getItem('token') || '';

  const {
    users,
    totalPages,
    currentPage,
    loading,
    error,
    setPage,
    setSearchTerm: setUserSearchTerm,
    refresh
  } = useUserAccesses(token, selectedEvent?.id ?? null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSearchTerm(searchTerm);
    setPage(1); // Reset to first page when searching
  };

  const handleImportUsers = async (file: File) => {
    if (!selectedEvent) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.hellomais.com.br/users/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Falha ao importar usuários');
      }

      await refresh();
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <div className="w-64">
            <EventSelector
              selectedEvent={selectedEvent}
              onEventChange={(event) => {
                localStorage.setItem('selectedEvent', JSON.stringify(event));
                setSelectedEvent(event);
              }}
            />
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="with-icon w-64 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Buscar
              </button>
            </form>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Novo Usuário
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-5 w-5 mr-2" />
                Importar Usuários
              </button>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <UserTable
              users={users}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecione um evento para visualizar os usuários
        </div>
      )}

      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportUsers}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => {
          refresh();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}

export default UsersPage;