import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Translation {
  language: string;
  title: string;
  description: string;
}

interface Speaker {
  name: string;
  position: string;
}

interface ScheduleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    id: number;
    startDateTime: string;
    endDateTime: string;
    translations: {
      "pt-BR": {
        title: string;
        description: string;
      };
      "es-ES": {
        title: string;
        description: string;
      };
    };
    speakers: Array<{
      name: string;
      position: string;
    }>;
  };
  onSave: (
    scheduleId: number,
    data: {
      startDateTime: string;
      endDateTime: string;
      translations: Translation[];
      speakers: Speaker[];
    }
  ) => Promise<void>;
}

function ScheduleEditModal({
  isOpen,
  onClose,
  schedule,
  onSave,
}: ScheduleEditModalProps) {
  const [startDateTime, setStartDateTime] = useState(
    schedule.startDateTime.slice(0, 16)
  );
  const [endDateTime, setEndDateTime] = useState(
    schedule.endDateTime.slice(0, 16)
  );
  const [translations, setTranslations] = useState<Translation[]>([
    {
      language: "pt-BR",
      title: schedule.translations["pt-BR"].title,
      description: schedule.translations["pt-BR"].description,
    },
    {
      language: "es-ES",
      title: schedule.translations["es-ES"].title,
      description: schedule.translations["es-ES"].description,
    },
  ]);
  const [speakers, setSpeakers] = useState<Speaker[]>(schedule.speakers);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const adjustTimeZone = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset).toISOString();
      };

      await onSave(schedule.id, {
        startDateTime: adjustTimeZone(startDateTime),
        endDateTime: adjustTimeZone(endDateTime),
        translations,
        speakers,
      });
      onClose();
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpeaker = () => {
    setSpeakers([...speakers, { name: "", position: "" }]);
  };

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const handleSpeakerChange = (
    index: number,
    field: keyof Speaker,
    value: string
  ) => {
    const newSpeakers = [...speakers];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    setSpeakers(newSpeakers);
  };

  const handleTranslationChange = (
    language: string,
    field: "title" | "description",
    value: string
  ) => {
    setTranslations(
      translations.map((t) =>
        t.language === language ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Programação
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Translations */}
              <div className="space-y-6 mb-6">
                <h4 className="font-medium text-gray-900">Traduções</h4>

                {/* Portuguese */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-4">Português</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <input
                        type="text"
                        value={
                          translations.find((t) => t.language === "pt-BR")
                            ?.title || ""
                        }
                        onChange={(e) =>
                          handleTranslationChange(
                            "pt-BR",
                            "title",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        value={
                          translations.find((t) => t.language === "pt-BR")
                            ?.description || ""
                        }
                        onChange={(e) =>
                          handleTranslationChange(
                            "pt-BR",
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Spanish */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-4">Español</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <input
                        type="text"
                        value={
                          translations.find((t) => t.language === "es-ES")
                            ?.title || ""
                        }
                        onChange={(e) =>
                          handleTranslationChange(
                            "es-ES",
                            "title",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        value={
                          translations.find((t) => t.language === "es-ES")
                            ?.description || ""
                        }
                        onChange={(e) =>
                          handleTranslationChange(
                            "es-ES",
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Speakers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Palestrantes</h4>
                  <button
                    type="button"
                    onClick={handleAddSpeaker}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {speakers.map((speaker, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nome"
                          value={speaker.name}
                          onChange={(e) =>
                            handleSpeakerChange(index, "name", e.target.value)
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Cargo"
                          value={speaker.position}
                          onChange={(e) =>
                            handleSpeakerChange(
                              index,
                              "position",
                              e.target.value
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Salvando..." : "Salvar"}
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

export default ScheduleEditModal;
