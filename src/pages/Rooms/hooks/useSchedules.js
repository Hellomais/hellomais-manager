import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEvent } from '../../../contexts/EventContext';

export function useSchedules(roomId) {
  const { selectedEvent } = useEvent();
  const [schedules, setSchedules] = useState([]);
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

  // Buscar programações
  const fetchSchedules = useCallback(async () => {
    if (!roomId || !selectedEvent?.id) {
      setSchedules([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api().get(`/rooms/${roomId}`);
      
      // Transformar o objeto de schedules em um array achatado
      const schedulesData = response.data.schedules 
        ? Object.values(response.data.schedules).flat()
        : [];
      
      const formattedSchedules = schedulesData.map(schedule => ({
        ...schedule,
        translations: schedule.translations || {
          'pt-BR': { title: '', description: '' },
          'en-US': { title: '', description: '' },
          'es-ES': { title: '', description: '' }
        }
      }));

      setSchedules(formattedSchedules);
      return formattedSchedules;
    } catch (error) {
      console.error('Fetch schedules error:', error);
      setError(error);
      toast.error('Erro ao buscar programações');
      setSchedules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [roomId, selectedEvent, api]);

  // Criar nova programação
  const createSchedule = useCallback(async (scheduleData) => {
    if (!roomId) {
      toast.error('ID da sala não definido');
      return null;
    }

    try {
      setLoading(true);
      const response = await api().post(`/rooms/${roomId}/schedules`, scheduleData);
      
      // Atualizar lista de programações
      const newSchedule = {
        ...response.data,
        translations: response.data.translations || {
          'pt-BR': { title: '', description: '' },
          'en-US': { title: '', description: '' },
          'es-ES': { title: '', description: '' }
        }
      };

      setSchedules(prev => [...prev, newSchedule]);
      toast.success('Programação criada com sucesso!');
      return newSchedule;
    } catch (error) {
      console.error('Create schedule error:', error);
      toast.error('Erro ao criar programação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId, api]);

  // Atualizar programação
  const updateSchedule = useCallback(async (scheduleId, scheduleData) => {
    if (!roomId || !scheduleId) {
      toast.error('ID da sala ou programação não definido');
      return null;
    }

    try {
      setLoading(true);
      const response = await api().put(`/rooms/${roomId}/schedules/${scheduleId}`, scheduleData);
      
      // Atualizar lista de programações
      const updatedSchedule = {
        ...response.data,
        translations: response.data.translations || {
          'pt-BR': { title: '', description: '' },
          'en-US': { title: '', description: '' },
          'es-ES': { title: '', description: '' }
        }
      };

      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId ? updatedSchedule : schedule
        )
      );

      toast.success('Programação atualizada com sucesso!');
      return updatedSchedule;
    } catch (error) {
      console.error('Update schedule error:', error);
      toast.error('Erro ao atualizar programação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId, api]);

  // Atualizar status da programação
  const updateScheduleStatus = useCallback(async (scheduleId, status) => {
    if (!roomId || !scheduleId) {
      toast.error('ID da sala ou programação não definido');
      return null;
    }

    try {
      setLoading(true);
      const response = await api().patch(
        `/rooms/${roomId}/schedule/${scheduleId}/status`, 
        { status }
      );
      
      // Atualizar lista de programações
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, status: response.data.status } 
            : schedule
        )
      );

      toast.success('Status da programação atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Update schedule status error:', error);
      toast.error('Erro ao atualizar status da programação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId, api]);

  // Excluir programação
  const deleteSchedule = useCallback(async (scheduleId) => {
    if (!roomId || !scheduleId) {
      toast.error('ID da sala ou programação não definido');
      return false;
    }

    try {
      setLoading(true);
      await api().delete(`/rooms/${roomId}/schedules/${scheduleId}`);
      
      // Remover programação da lista
      setSchedules(prev => 
        prev.filter(schedule => schedule.id !== scheduleId)
      );

      toast.success('Programação excluída com sucesso!');
      return true;
    } catch (error) {
      console.error('Delete schedule error:', error);
      toast.error('Erro ao excluir programação');
      return false;
    } finally {
      setLoading(false);
    }
  }, [roomId, api]);

  // Carregar programações ao montar/atualizar
  useEffect(() => {
    if (roomId && selectedEvent?.id) {
      fetchSchedules();
    }
  }, [roomId, selectedEvent, fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    updateScheduleStatus,
    deleteSchedule
  };
}