
'use client';

import { useState, useEffect } from 'react';
import { jikanApi, Anime } from '../../lib/jikanApi';
import Header from '../../components/Header';
import AnimeCard from '../../components/AnimeCard';

export default function TrendingPage() {
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    loadTrending(1);
  }, []);

  const loadTrending = async (page: number) => {
    try {
      setLoading(true);
      const response = await jikanApi.getTopAnimes(page, 24);
      
      if (page === 1) {
        setTrendingAnimes(response.data || []);
      } else {
        setTrendingAnimes(prev => [...prev, ...(response.data || [])]);
      }
      
      setCurrentPage(page);
      setHasNextPage(response.pagination?.has_next_page || false);
    } catch (error) {
      console.error('Erro ao carregar animes em alta:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      loadTrending(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Em Alta</h1>
            <p className="text-gray-400">
              Os animes mais populares e bem avaliados do momento
            </p>
          </div>

          {loading && trendingAnimes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Carregando animes em alta...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {trendingAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>

              {hasNextPage && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Carregando...
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line"></i>
                        Carregar Mais
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
