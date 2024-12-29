import { useState, useEffect, useCallback } from 'react';
import { useEvent } from '../../../contexts/EventContext';
import toast from 'react-hot-toast';
import axios from 'axios';

export function useRoom(id) {
  const { selectedEvent } = useEvent();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Instância do axios com configurações padrão
  const api = useCallback(() => axios.create({
    baseURL: 'https://dev-api.hellomais.com.br',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'x-event-id': selectedEvent?.id?.toString()
    }
  }), [selectedEvent]);

  // Buscar sala
  const fetchRoom = useCallback(async () => {
    if (!id || !selectedEvent?.id) {
      toast.error('ID da sala ou evento não selecionado');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api().get(`/rooms/${id}`);
      
      // Garantir estrutura de tradução
      const formattedRoom = {
        ...response.data,
        translations: response.data.translations || {
          'pt-BR': { title: '', streamUrl: '' },
          'en-US': { title: '', streamUrl: '' },
          'es-ES': { title: '', streamUrl: '' }
        }
      };

      setRoom(formattedRoom);
      return formattedRoom;
    } catch (error) {
      setError(error);
      toast.error('Erro ao carregar sala');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, selectedEvent, api]);

  // Criar sala
  const createRoom = useCallback(async (roomData) => {
    if (!selectedEvent?.id) {
      toast.error('Nenhum evento selecionado');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api().post('/rooms', roomData);
      
      toast.success('Sala criada com sucesso!');
      return response.data;
    } catch (error) {
      setError(error);
      toast.error('Erro ao criar sala');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, api]);

  // Atualizar sala (mantido similar ao original)
  const updateRoom = useCallback(async (data) => {
    if (!id) {
      toast.error('ID da sala não definido');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api().put(`/rooms/${id}`, data);
      
      setRoom(response.data);
      toast.success('Sala atualizada com sucesso!');
      return response.data;
    } catch (error) {
      setError(error);
      toast.error('Erro ao atualizar sala');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, api]);

  // Atualizar status
  const updateStatus = useCallback(async (status) => {
    if (!id) {
      toast.error('ID da sala não definido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api().patch(`/rooms/${id}/status`, { status });
      
      toast.success('Status alterado com sucesso!');
      await fetchRoom();
    } catch (error) {
      setError(error);
      toast.error('Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  }, [id, fetchRoom, api]);

  // Excluir sala
  const deleteRoom = useCallback(async () => {
    if (!id) {
      toast.error('ID da sala não definido');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      await api().delete(`/rooms/${id}`);
      
      toast.success('Sala excluída com sucesso!');
      return true;
    } catch (error) {
      setError(error);
      toast.error('Erro ao excluir sala');
      return false;
    } finally {
      setLoading(false);
    }
  }, [id, api]);

  // Carregar sala ao montar/atualizar
  useEffect(() => {
    if (id) fetchRoom();
  }, [id, fetchRoom]);

  return {
    room,
    loading,
    error,
    fetchRoom,
    createRoom,
    updateRoom,
    updateStatus,
    deleteRoom
  };
}