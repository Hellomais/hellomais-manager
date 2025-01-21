import React, { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { User } from '../../types';
import UserEditModal from './UserEditModal';
import toast from 'react-hot-toast';

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function UserTable({ users, loading, error, currentPage, totalPages, onPageChange }: UserTableProps) {
  const [resettingPasswords, setResettingPasswords] = useState<Set<number>>(new Set());
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUsers, setDeletingUsers] = useState<Set<number>>(new Set());
  const selectedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
  const token = localStorage.getItem('token');

  const handleResetPassword = async (userId: number, email: string) => {
    if (resettingPasswords.has(userId)) return;
    
    setResettingPasswords(prev => new Set(prev).add(userId));
    
    try {
      const response = await fetch('https://api.hellomais.com.br/users/reset-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*',
          'x-event-id': selectedEvent.id.toString()
        },
        body: JSON.stringify({
          userId,
          email
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar senha');
      }

      toast.success('Senha enviada com sucesso!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Erro ao enviar senha. Por favor, tente novamente.');
    } finally {
      setResettingPasswords(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (deletingUsers.has(userId)) return;
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      return;
    }

    setDeletingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await fetch(`https://api.hellomais.com.br/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso!');
      // Refresh the current page
      onPageChange(currentPage);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao excluir usuário. Por favor, tente novamente.');
    } finally {
      setDeletingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acessou
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Senha
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Carregando...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                {error}
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Nenhum usuário encontrado
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.hasLoggedIn
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.hasLoggedIn ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleResetPassword(user.id, user.email)}
                    disabled={resettingPasswords.has(user.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resettingPasswords.has(user.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Senha'
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingUserId(user.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deletingUsers.has(user.id)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Excluir"
                    >
                      {deletingUsers.has(user.id) ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {!loading && !error && users.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUserId && (
        <UserEditModal
          isOpen={true}
          onClose={() => setEditingUserId(null)}
          userId={editingUserId}
          onSave={() => {
            // Refresh the users list
            onPageChange(currentPage);
          }}
        />
      )}
    </div>
  );
}

export default UserTable;