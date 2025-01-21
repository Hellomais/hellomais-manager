import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Room {
  id: number;
  title: string;
  status: 'ONLINE' | 'WAITING' | 'FINISHED';
  streamUrl: string;
  streamUrl_Es: string;
}

interface RoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onSave: (room: Room) => void;
}

function RoomEditModal({ isOpen, onClose, room, onSave }: RoomEditModalProps) {
  const [editedRoom, setEditedRoom] = useState<Room>(room);

  // Update editedRoom when room prop changes
  useEffect(() => {
    setEditedRoom(room);
  }, [room]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedRoom);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Sala
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editedRoom.title}
                    onChange={(e) => setEditedRoom({ ...editedRoom, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stream URL
                  </label>
                  <input
                    type="text"
                    value={editedRoom.streamUrl}
                    onChange={(e) => setEditedRoom({ ...editedRoom, streamUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stream URL (Espanhol)
                  </label>
                  <input
                    type="text"
                    value={editedRoom.streamUrl_Es}
                    onChange={(e) => setEditedRoom({ ...editedRoom, streamUrl_Es: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomEditModal;