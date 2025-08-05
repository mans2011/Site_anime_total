
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  buscarTopAvaliados, 
  buscarTemporadaAtual, 
  buscarMaisVistos,
  buscarSinopsePT,
  Anime 
} from '../lib/jikanApi';
import { userStorage } from '../lib/userStorage';
import Header from '../components/Header';
import AnimeCard from '../components/AnimeCard';

export default function Home() {
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([]);
  const [seasonalAnimes, setSeasonalAnimes] = useState<Anime[]>([]);
  const [topAnimes, setTopAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadHomeData();
    // Verificar se o usuário está logado
    const currentUser = userStorage.getCurrentUser();
    setUser(currentUser);
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      const [topAnimesList, seasonalAnimesList, popularAnimesList] = await Promise.all([
        buscarTopAvaliados(25),
        buscarTemporadaAtual(),
        buscarMaisVistos(15)
      ]);

      if (topAnimesList.length > 0) {
        const featured = topAnimesList[0];
        
        // Tentar buscar sinopse em português
        const sinopsePT = await buscarSinopsePT(featured.title as string);
        if (sinopsePT) {
          featured.synopsis = sinopsePT;
        }
        
        setFeaturedAnime(featured);
        setTopAnimes(topAnimesList.slice(1, 13));
      }
      
      setTrendingAnimes(popularAnimesList.slice(0, 8));
      setSeasonalAnimes(seasonalAnimesList.slice(0, 12));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayFeatured = () => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (featuredAnime) {
      userStorage.addToWatchHistory(featuredAnime.mal_id);
      window.location.href = `/anime/${featuredAnime.mal_id}`;
    }
  };

  const handleAddToWatchlist = () => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (featuredAnime) {
      userStorage.addToWatchlist(featuredAnime.mal_id);
    }
  };

  const getAnimeTitle = (anime: Anime): string => {
    if (typeof anime.title === 'string') return anime.title;
    return anime.title_english || anime.title_japanese || 'Título não disponível';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando animes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {featuredAnime && (
        <section 
          className="relative h-screen flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: featuredAnime.bannerImage 
              ? `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url('${featuredAnime.bannerImage}')`
              : `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url('https://readdy.ai/api/search-image?query=epic%20anime%20landscape%20with%20dramatic%20sky%20and%20vibrant%20colors%2C%20cinematic%20lighting%2C%20beautiful%20scenery%20with%20mountains%20and%20clouds%2C%20anime%20style%20background%20art%2C%20high%20quality%20digital%20painting&width=1920&height=1080&seq=hero1&orientation=landscape')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center h-full">
            <div className="w-full max-w-2xl text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {getAnimeTitle(featuredAnime)}
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed line-clamp-3">
                {featuredAnime.synopsis}
              </p>
              <div className="flex items-center gap-4 mb-8">
                {featuredAnime.score && (
                  <div className="flex items-center text-yellow-400">
                    <i className="ri-star-fill mr-2"></i>
                    <span className="font-bold text-lg">{featuredAnime.score}</span>
                  </div>
                )}
                {featuredAnime.year && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-white">{featuredAnime.year}</span>
                  </>
                )}
                {featuredAnime.episodes && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-white">{featuredAnime.episodes} episódios</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlayFeatured}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-play-fill text-xl"></i>
                  Assistir Agora
                </button>
                <button
                  onClick={handleAddToWatchlist}
                  className="bg-gray-800/80 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-bookmark-line text-xl"></i>
                  Minha Lista
                </button>
                <Link
                  href={`/anime/${featuredAnime.mal_id}`}
                  className="bg-gray-800/80 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-information-line text-xl"></i>
                  Mais Informações
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="relative -mt-32 z-20 bg-gradient-to-t from-black to-transparent pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {trendingAnimes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🔥 Mais Populares</h2>
                <Link href="/trending" className="text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                  Ver Todos
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {trendingAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {seasonalAnimes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🌸 Temporada Atual</h2>
                <Link href="/seasonal" className="text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                  Ver Todos
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {seasonalAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {topAnimes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">⭐ Top Avaliados</h2>
                <Link href="/top" className="text-red-500 hover:text-red-400 transition-colors cursor-pointer">
                  Ver Todos
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {topAnimes.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            </section>
          )}

          {/* Mostrar seção apenas se o usuário NÃO estiver logado */}
          {!user && (
            <section className="bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">🎌 Descubra novos animes!</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Crie sua conta para salvar seus favoritos, acompanhar episódios e muito mais!
              </p>
              <Link
                href="/login"
                className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-add-line"></i>
                Começar Agora
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
