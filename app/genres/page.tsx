
'use client';

import { useState, useEffect } from 'react';
import { buscarGeneros, buscarPorGenero, Genre, Anime } from '../../lib/jikanApi';
import Header from '../../components/Header';
import AnimeCard from '../../components/AnimeCard';

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreAnimes, setGenreAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingAnimes, setSearchingAnimes] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const genresData = await buscarGeneros();
      setGenres(genresData);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genreName: string) => {
    setSelectedGenre(genreName);
    setSearchingAnimes(true);
    
    try {
      const animes = await buscarPorGenero(genreName);
      setGenreAnimes(animes);
    } catch (error) {
      console.error('Erro ao buscar animes do gênero:', error);
      setGenreAnimes([]);
    } finally {
      setSearchingAnimes(false);
    }
  };

  const popularGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
    'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Horror', 'Mystery'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando gêneros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🎭 Explorar por Gêneros</h1>
            <p className="text-gray-400">
              Descubra animes organizados por categoria e encontre exatamente o que você procura
            </p>
          </div>

          {/* Gêneros Populares */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Gêneros Populares</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularGenres.map((genreName) => (
                <button
                  key={genreName}
                  onClick={() => handleGenreSelect(genreName)}
                  className={`p-4 rounded-xl text-center font-semibold transition-all duration-200 cursor-pointer ${
                    selectedGenre === genreName
                      ? 'bg-red-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {getGenreEmoji(genreName)}
                  </div>
                  <div className="text-sm">{genreName}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Todos os Gêneros */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Todos os Gêneros</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.mal_id}
                  onClick={() => handleGenreSelect(genre.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedGenre === genre.name
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </section>

          {/* Resultados */}
          {selectedGenre && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {getGenreEmoji(selectedGenre)} {selectedGenre}
                </h2>
                <p className="text-gray-400">
                  {searchingAnimes 
                    ? 'Buscando...' 
                    : `${genreAnimes.length} ${genreAnimes.length === 1 ? 'anime encontrado' : 'animes encontrados'}`
                  }
                </p>
              </div>

              {searchingAnimes ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Buscando animes de {selectedGenre}...</p>
                  </div>
                </div>
              ) : genreAnimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {genreAnimes.map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <i className="ri-emotion-sad-line text-6xl text-gray-400 mb-6"></i>
                  <h3 className="text-xl text-white mb-4">Nenhum anime encontrado</h3>
                  <p className="text-gray-400">
                    Não encontramos animes para o gênero "{selectedGenre}". 
                    Tente outro gênero.
                  </p>
                </div>
              )}
            </section>
          )}

          {!selectedGenre && (
            <div className="text-center py-20">
              <i className="ri-movie-2-line text-6xl text-gray-400 mb-6"></i>
              <h2 className="text-2xl text-white mb-4">Selecione um gênero</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Escolha um gênero acima para descobrir animes incríveis organizados por categoria.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getGenreEmoji(genreName: string): string {
  const emojiMap: Record<string, string> = {
    'Action': '⚔️',
    'Adventure': '🗺️',
    'Comedy': '😂',
    'Drama': '🎭',
    'Fantasy': '🐉',
    'Romance': '💕',
    'Sci-Fi': '🚀',
    'Slice of Life': '🌸',
    'Supernatural': '👻',
    'Thriller': '😱',
    'Horror': '🎃',
    'Mystery': '🔍',
    'Sports': '⚽',
    'Music': '🎵',
    'School': '🏫',
    'Military': '⚔️',
    'Historical': '🏛️',
    'Mecha': '🤖'
  };
  
  return emojiMap[genreName] || '🎬';
}
