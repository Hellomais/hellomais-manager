import React from 'react';
import { Clock, Users, Edit } from 'lucide-react';

interface Speaker {
  id: number;
  name: string;
  position: string;
}

interface Schedule {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  translations: {
    'pt-BR': {
      title: string;
      description: string;
    };
  };
  speakers: Speaker[];
}

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
}

function ScheduleCard({ schedule, onEdit }: ScheduleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{schedule.startTime} - {schedule.endTime}</span>
            </div>
            <button
              onClick={() => onEdit(schedule)}
              className="text-blue-600 hover:text-blue-700"
              title="Editar"
            >
              <Edit className="h-5 w-5" />
            </button>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {schedule.translations['pt-BR'].title}
          </h3>
          <p className="text-gray-600 mb-4">
            {schedule.translations['pt-BR'].description}
          </p>
          
          {schedule.speakers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Palestrantes</span>
              </div>
              <div className="space-y-1">
                {schedule.speakers.map((speaker) => (
                  <div key={speaker.id} className="text-sm">
                    <span className="font-medium text-gray-900">{speaker.name}</span>
                    <span className="text-gray-500"> - {speaker.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-6">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${schedule.status === 'WAITING'
                ? 'bg-yellow-100 text-yellow-800'
                : schedule.status === 'ONLINE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
              }`}
          >
            {schedule.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ScheduleCard;