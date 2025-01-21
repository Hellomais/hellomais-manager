import React, { useState, useEffect } from 'react';
import { Loader2, Search, Trash2, Save, Hash } from 'lucide-react';
import EventSelector from '../components/EventSelector';
import { Event } from '../types';
import toast from 'react-hot-toast';

interface InstagramPost {
  id: number;
  url: string;
}

interface SearchPost {
  id: string;
  imageUrl: string;
  s3Key: string;
  fileType: string;
}

function InstagramPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });
  const [savedPosts, setSavedPosts] = useState<InstagramPost[]>([]);
  const [searchResults, setSearchResults] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [selectedSearchPosts, setSelectedSearchPosts] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [hashtag, setHashtag] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const token = localStorage.getItem('token');

  const fetchSavedPosts = async () => {
    if (!selectedEvent || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.hellomais.com.br/instagram/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar fotos');
      }

      const data = await response.json();
      setSavedPosts(data.posts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, [selectedEvent]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashtag.trim() || !token) return;

    setSearching(true);
    setError(null);
    setShowSearchResults(true);

    try {
      const response = await fetch(
        `https://api.hellomais.com.br/instagram/posts/search?hashtag=${encodeURIComponent(hashtag)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar fotos');
      }

      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        toast.error('Nenhuma foto encontrada para esta hashtag');
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar fotos');
      toast.error('Erro ao buscar fotos. Por favor, tente novamente.');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedSearchPosts.size === 0 || !selectedEvent) return;

    setSaving(true);
    try {
      const postsToSave = searchResults
        .filter(post => selectedSearchPosts.has(post.id))
        .map(post => ({
          id: post.id,
          url: post.imageUrl
        }));

      const response = await fetch('https://api.hellomais.com.br/instagram/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'x-event-id': selectedEvent.id.toString(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          posts: postsToSave
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar fotos');
      }

      const savedResults = await response.json();
      toast.success(`${savedResults.length} foto${savedResults.length > 1 ? 's' : ''} salva${savedResults.length > 1 ? 's' : ''} com sucesso!`);
      
      // Clear selection and refresh
      setSelectedSearchPosts(new Set());
      setShowSearchResults(false);
      await fetchSavedPosts();
    } catch (error) {
      console.error('Error saving posts:', error);
      toast.error('Erro ao salvar fotos. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPosts.size === 0) return;

    if (!confirm(`Tem certeza que deseja remover ${selectedPosts.size} foto${selectedPosts.size > 1 ? 's' : ''} dos destaques?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('https://api.hellomais.com.br/instagram/posts', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*',
          'x-event-id': selectedEvent?.id.toString() || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(selectedPosts)
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao remover fotos');
      }

      const result = await response.json();
      toast.success(`${result.deletedCount} foto${result.deletedCount > 1 ? 's' : ''} removida${result.deletedCount > 1 ? 's' : ''} com sucesso!`);
      
      // Clear selection and refresh
      setSelectedPosts(new Set());
      await fetchSavedPosts();
    } catch (error) {
      console.error('Error deleting posts:', error);
      toast.error('Erro ao remover fotos. Por favor, tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Instagram</h1>
          <div className="flex items-center space-x-4">
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
      </div>

      {selectedEvent && (
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="Buscar hashtag..."
                className="with-icon w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !hashtag.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </button>
            {showSearchResults && (
              <button
                type="button"
                onClick={() => {
                  setShowSearchResults(false);
                  setSelectedSearchPosts(new Set());
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Voltar para Salvos
              </button>
            )}
          </form>
        </div>
      )}

      {selectedEvent ? (
        showSearchResults ? (
          // Search Results
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Resultados da busca
              </h2>
              {selectedSearchPosts.size > 0 && (
                <button
                  onClick={handleSaveSelected}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Selecionados ({selectedSearchPosts.size})
                    </>
                  )}
                </button>
              )}
            </div>
            {searching ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">
                {error}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Nenhuma foto encontrada
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((post) => (
                  <div
                    key={post.id}
                    className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer ${
                      selectedSearchPosts.has(post.id) ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedSearchPosts(prev => {
                        const next = new Set(prev);
                        if (next.has(post.id)) {
                          next.delete(post.id);
                        } else {
                          next.add(post.id);
                        }
                        return next;
                      });
                    }}
                  >
                    <img
                      src={post.imageUrl}
                      alt="Instagram post"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${
                      selectedSearchPosts.has(post.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          selectedSearchPosts.has(post.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-white'
                        }`}>
                          {selectedSearchPosts.has(post.id) && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Saved Posts
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Fotos Salvas
              </h2>
              {selectedPosts.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Selecionados ({selectedPosts.size})
                    </>
                  )}
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">
                {error}
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Nenhuma foto salva ainda
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer ${
                      selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedPosts(prev => {
                        const next = new Set(prev);
                        if (next.has(post.id)) {
                          next.delete(post.id);
                        } else {
                          next.add(post.id);
                        }
                        return next;
                      });
                    }}
                  >
                    <img
                      src={post.url}
                      alt="Instagram post"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${
                      selectedPosts.has(post.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          selectedPosts.has(post.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-white'
                        }`}>
                          {selectedPosts.has(post.id) && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecione um evento para visualizar as fotos
        </div>
      )}
    </div>
  );
}

export default InstagramPage;