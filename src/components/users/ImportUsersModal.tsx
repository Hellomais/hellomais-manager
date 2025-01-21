import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

interface ImportResponse {
  totalProcessed: number;
  created: number;
  updated: number;
  errors: string[];
}

function ImportUsersModal({ isOpen, onClose, onImport }: ImportUsersModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('https://api.hellomais.com.br/users/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-event-id': JSON.parse(localStorage.getItem('selectedEvent') || '{}').id.toString()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Falha ao importar usuários');
      }

      const results: ImportResponse = await response.json();
      setImportResults(results);
      
      if (results.errors.length === 0) {
        toast.success(`Importação concluída! ${results.totalProcessed} registros processados.`);
      } else {
        toast.error(`Importação concluída com ${results.errors.length} erros.`);
      }
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Erro ao importar usuários. Por favor, tente novamente.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setImportResults(null); // Reset results when new file is selected
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Importar Usuários
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Arquivo CSV
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Apenas arquivos CSV são aceitos
                  </p>
                </div>

                {/* Import Results */}
                {importResults && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Resultado da Importação
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        Total processado: <span className="font-medium">{importResults.totalProcessed}</span>
                      </p>
                      <p className="text-green-600">
                        Criados: <span className="font-medium">{importResults.created}</span>
                      </p>
                      <p className="text-blue-600">
                        Atualizados: <span className="font-medium">{importResults.updated}</span>
                      </p>
                      {importResults.errors.length > 0 && (
                        <div>
                          <p className="text-red-600 font-medium">Erros ({importResults.errors.length}):</p>
                          <ul className="mt-1 list-disc list-inside text-red-600 text-xs">
                            {importResults.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!selectedFile || importing}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </>
                )}
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

export default ImportUsersModal;