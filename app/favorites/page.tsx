'use client';

import { useState, useEffect } from 'react';
import { jikanApi, Anime } from '../../lib/jikanApi';
import { userStorage } from '../../lib/userStorage';
import Header from '../../components/Header';
import AnimeCard from '../../components/AnimeCard';

export default function FavoritesPage() {
  const [favoriteAnimes, setFavoriteAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(userStorage.getCurrentUser());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user || user.favorites.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Carregar animes em lotes para evitar sobrecarga da API
      const batchSize = 5;
      const animes: Anime[] = [];
      
      for (let i = 0; i < user.favorites.length; i += batchSize) {
        const batch = user.favorites.slice(i, i + batchSize);
        const animePromises = batch.map(async (id) => {
          try {
            return await jikanApi.getAnimeById(id);
          } catch (error) {
            console.error(`Erro ao carregar anime ${id}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(animePromises);
        animes.push(...batchResults.filter(anime => anime !== null) as Anime[]);
        
        // Pequena pausa entre lotes para respeitar rate limit
        if (i + batchSize < user.favorites.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setFavoriteAnimes(animes);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setError('Erro ao carregar seus favoritos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritesChange = () => {
    // Atualizar o estado do usuário e recarregar a lista
    const updatedUser = userStorage.getCurrentUser();
    setUser(updatedUser);
    if (updatedUser) {
      loadFavorites();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Meus Favoritos</h1>
            <p className="text-gray-400">
              {user.favorites.length > 0 
                ? `${user.favorites.length} animes nos seus favoritos`
                : 'Você ainda não tem favoritos'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Carregando seus favoritos...</p>
              </div>
            </div>
          ) : favoriteAnimes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {favoriteAnimes.map((anime) => (
                <AnimeCard 
                  key={anime.mal_id} 
                  anime={anime} 
                  onWatchlistChange={handleFavoritesChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <i className="ri-heart-line text-6xl text-gray-400 mb-6"></i>
              <h2 className="text-2xl text-white mb-4">Nenhum favorito ainda</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Marque animes como favoritos para salvá-los aqui. 
                Clique no ícone de coração nos animes que você mais gosta.
              </p>
              <a
                href="/"
                className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-heart-line"></i>
                Descobrir Animes
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}