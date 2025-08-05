
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { buscarPorNome, Anime } from '../../lib/jikanApi';
import Header from '../../components/Header';
import AnimeCard from '../../components/AnimeCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    try {
      setLoading(true);
      const results = await buscarPorNome(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
      window.history.pushState({}, '', newUrl);
      performSearch(searchTerm.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar animes..."
                className="w-full bg-gray-900 text-white px-6 py-4 pr-16 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-search-line text-xl"></i>
              </button>
            </form>
          </div>

          {query && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Resultados para: "{query}"
              </h1>
              <p className="text-gray-400">
                {loading 
                  ? 'Buscando...' 
                  : `${searchResults.length} ${searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
                }
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Buscando animes...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {searchResults.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-20">
              <i className="ri-search-line text-6xl text-gray-400 mb-6"></i>
              <h2 className="text-2xl text-white mb-4">Nenhum resultado encontrado</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Não encontramos animes com o termo "{query}". 
                Tente usar palavras-chave diferentes ou verifique a ortografia.
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <i className="ri-search-eye-line text-6xl text-gray-400 mb-6"></i>
              <h2 className="text-2xl text-white mb-4">Busque seus animes favoritos</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Use a barra de busca acima para encontrar animes por título, 
                gênero ou qualquer palavra-chave.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
