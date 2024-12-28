import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "../ui/alert-dialog";
  import toast from 'react-hot-toast';
  import { useEvent } from '../../contexts/EventContext';
  
  export default function DeleteEventDialog({ isOpen, onClose, event, onSuccess }) {
    const { selectedEvent } = useEvent();
  
    const handleDelete = async () => {
      const loadingToast = toast.loading('Excluindo evento...');
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/events/${event.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });
  
        if (!response.ok) {
          throw new Error('Erro ao excluir evento');
        }
  
        toast.success('Evento excluído com sucesso!', { id: loadingToast });
        onSuccess();
        onClose();
      } catch (error) {
        toast.error(error.message || 'Erro ao excluir evento', { id: loadingToast });
      }
    };
  
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento{' '}
              <span className="font-semibold">{event?.title}</span> e removerá seus dados
              do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }