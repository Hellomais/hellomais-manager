import React, { useState, useEffect } from 'react';
import { useEvent } from '../contexts/EventContext';
import { Search, ChevronUp, ChevronDown, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import UserFormModal from '../components/users/UserFormModal';
import DeleteUserDialog from '../components/users/DeleteUserDialog';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { selectedEvent } = useEvent();

  useEffect(() => {
    fetchUsers();
  }, [selectedEvent]);

  const fetchUsers = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev-api.hellomais.com.br/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
      
      const compareResult = a[sortConfig.key].toLowerCase().localeCompare(b[sortConfig.key].toLowerCase());
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="opacity-0 group-hover:opacity-50" size={16} />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="opacity-100" size={16} /> : 
      <ChevronDown className="opacity-100" size={16} />;
  };

  if (!selectedEvent) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Selecione um evento para visualizar os usuários.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">Usuários</h1>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Novo Usuário
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nome</span>
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      <SortIcon column="email" />
                    </div>
                  </th>
                  <th 
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Papel</span>
                      <SortIcon column="role" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photo ? (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={user.photo}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full mr-3 bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsFormModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar usuário"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modal de Criação/Edição */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}