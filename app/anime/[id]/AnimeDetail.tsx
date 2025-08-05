'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  buscarPorId, 
  buscarSinopsePT, 
  buscarDetalhesSerie,
  jikanApi, 
  Anime, 
  AnimeCharacter, 
  AnimeRecommendation 
} from '../../../lib/jikanApi';
import { userStorage, commentStorage, Comment } from '../../../lib/userStorage';
import Header from '../../../components/Header';
import AnimeCard from '../../../components/AnimeCard';
import CommentsSection from '../../../components/CommentsSection';
import EpisodesList from '../../../components/EpisodesList';
import VideoPlayer from '../../../components/VideoPlayer';
import WatchParty from '../../../components/WatchParty';
import RecommendationEngine from '../../../components/RecommendationEngine';

interface AnimeDetailProps {
  animeId: number;
}

export default function AnimeDetail({ animeId }: AnimeDetailProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [recommendations, setRecommendations] = useState<AnimeRecommendation[]>([]);
  const [serieDetails, setSerieDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [activeTab, setActiveTab] = useState('episodes');

  useEffect(() => {
    loadAnimeData();
    checkUserActions();
  }, [animeId]);

  const loadAnimeData = async () => {
    try {
      setLoading(true);
      
      // Usar a nova API melhorada
      const animeData = await buscarPorId(animeId);
      if (!animeData) {
        setLoading(false);
        return;
      }

      setAnime(animeData);

      // Tentar buscar sinopse em português
      const animeTitle = getAnimeTitle(animeData);
      const [sinopsePT, detalhesSerie] = await Promise.all([
        buscarSinopsePT(animeTitle),
        buscarDetalhesSerie(animeTitle)
      ]);

      if (sinopsePT) {
        animeData.synopsis = sinopsePT;
        setAnime({ ...animeData });
      }

      if (detalhesSerie) {
        setSerieDetails(detalhesSerie);
      }

      // Buscar personagens e recomendações usando a API original
      const [charactersData, recommendationsData] = await Promise.all([
        jikanApi.getAnimeCharacters(animeId),
        jikanApi.getAnimeRecommendations(animeId)
      ]);

      setCharacters(charactersData.slice(0, 12));
      setRecommendations(recommendationsData.slice(0, 12));
    } catch (error) {
      console.error('Erro ao carregar dados do anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserActions = () => {
    const user = userStorage.getCurrentUser();
    if (user) {
      setIsInWatchlist(user.watchlist.includes(animeId));
      setIsInFavorites(user.favorites.includes(animeId));
      setUserRating(userStorage.getUserRating(animeId));
    }
  };

  const getAnimeTitle = (anime: Anime): string => {
    if (typeof anime.title === 'string') return anime.title;
    return anime.title_english || anime.title_japanese || 'Título não disponível';
  };

  const handleWatchlist = () => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isInWatchlist) {
      userStorage.removeFromWatchlist(animeId);
      setIsInWatchlist(false);
    } else {
      userStorage.addToWatchlist(animeId);
      setIsInWatchlist(true);
    }
  };

  const handleFavorites = () => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isInFavorites) {
      userStorage.removeFromFavorites(animeId);
      setIsInFavorites(false);
    } else {
      userStorage.addToFavorites(animeId);
      setIsInFavorites(true);
    }
  };

  const handleWatch = (episodeNumber = 1) => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setCurrentEpisode(episodeNumber);
    setShowPlayer(true);
    userStorage.addToWatchHistory(animeId, episodeNumber);
  };

  const handleRating = (rating: number) => {
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    userStorage.rateAnime(animeId, rating);
    setUserRating(rating);
  };

  const getEpisodesList = () => {
    if (!serieDetails || !serieDetails.temporadas) {
      // Gerar episódios padrão baseado no número de episódios
      const episodeCount = anime?.episodes || 12;
      return Array.from({ length: episodeCount }, (_, i) => ({
        numero: i + 1,
        nome: `Episódio ${i + 1}`,
        duracao: '24 min'
      }));
    }

    // Usar episódios reais do TMDB
    const allEpisodes = [];
    for (const temporada of serieDetails.temporadas) {
      allEpisodes.push(...temporada.episodios);
    }
    return allEpisodes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl text-white mb-4">Anime não encontrado</h2>
            <Link href="/" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const animeTitle = getAnimeTitle(anime);
  const episodes = getEpisodesList();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center bg-cover bg-center"
        style={{
          backgroundImage: anime.bannerImage 
            ? `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%), url(${anime.bannerImage})`
            : `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 100%), url('https://readdy.ai/api/search-image?query=anime%20$%7BanimeTitle%7D%20epic%20scene%20with%20dramatic%20lighting%20and%20vibrant%20colors%2C%20high%20quality%20anime%20artwork%2C%20cinematic%20composition%2C%20beautiful%20detailed%20background&width=1920&height=1080&seq=detail${animeId}&orientation=landscape')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center h-full pt-16">
          <div className="lg:col-span-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {animeTitle}
            </h1>
            {anime.title_english && anime.title_english !== animeTitle && (
              <h2 className="text-2xl text-gray-300 mb-4">{anime.title_english}</h2>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {anime.score && (
                <div className="flex items-center text-yellow-400">
                  <i className="ri-star-fill mr-2"></i>
                  <span className="font-bold text-xl">{anime.score}</span>
                  {anime.scored_by && (
                    <span className="text-gray-400 ml-2">({anime.scored_by.toLocaleString()} votos)</span>
                  )}
                </div>
              )}
              {anime.year && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-white">{anime.year}</span>
                </>
              )}
              {anime.episodes && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-white">{anime.episodes} episódios</span>
                </>
              )}
              {anime.rating && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-white">{anime.rating}</span>
                </>
              )}
            </div>
            
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((genre) => (
                  <span
                    key={genre.mal_id || genre.name}
                    className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-lg text-gray-300 mb-8 leading-relaxed line-clamp-4">
              {anime.synopsis}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleWatch()}
                className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-play-fill text-xl"></i>
                Assistir Agora
              </button>
              <button
                onClick={handleWatchlist}
                className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isInWatchlist
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-800/80 text-white hover:bg-gray-700'
                }`}
              >
                <i className={`ri-bookmark-${isInWatchlist ? 'fill' : 'line'} text-xl`}></i>
                {isInWatchlist ? 'Na Minha Lista' : 'Adicionar à Lista'}
              </button>
              <button
                onClick={handleFavorites}
                className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isInFavorites
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-gray-800/80 text-white hover:bg-gray-700'
                }`}
              >
                <i className={`ri-heart-${isInFavorites ? 'fill' : 'line'} text-xl`}></i>
                {isInFavorites ? 'Favoritado' : 'Favoritar'}
              </button>
              {anime.trailer && anime.trailer.youtube_id && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="bg-gray-800/80 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-video-line text-xl"></i>
                  Trailer
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <img
                src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                alt={animeTitle}
                className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
              />
              {anime.rank && (
                <div className="absolute -bottom-4 -right-4 bg-black/80 text-white px-4 py-2 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">#{anime.rank}</div>
                    <div className="text-sm text-gray-400">Ranking</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section className="py-8 bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl text-white mb-4">Avalie este anime</h3>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
                    userRating && userRating >= rating
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {userRating && (
              <p className="text-yellow-400 mt-2">Sua avaliação: {userRating}/10</p>
            )}
          </div>
        </div>
      </section>

      <main className="py-12 space-y-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {[
              { id: 'episodes', label: '📺 Episódios', icon: 'ri-film-line' },
              { id: 'info', label: 'ℹ️ Informações', icon: 'ri-information-line' },
              { id: 'characters', label: '👥 Personagens', icon: 'ri-group-line' },
              { id: 'comments', label: '💬 Comentários', icon: 'ri-chat-3-line' },
              { id: 'recommendations', label: '🎯 Recomendações', icon: 'ri-magic-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'episodes' && (
            <EpisodesList 
              animeId={animeId}
              episodes={episodes}
              totalEpisodes={anime.episodes}
            />
          )}

          {activeTab === 'info' && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Informações</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">{anime.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fonte:</span>
                    <span className="text-white">{anime.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white">{anime.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exibição:</span>
                    <span className="text-white">{anime.aired?.string}</span>
                  </div>
                  {anime.studios && anime.studios.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estúdios:</span>
                      <span className="text-white">{anime.studios.map(s => s.name).join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Popularidade:</span>
                    <span className="text-white">#{anime.popularity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Membros:</span>
                    <span className="text-white">{anime.members?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favoritos:</span>
                    <span className="text-white">{anime.favorites?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/30 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Sinopse</h3>
                <p className="text-gray-300 leading-relaxed">{anime.synopsis}</p>
              </div>
            </section>
          )}

          {activeTab === 'characters' && characters.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-white mb-6">Personagens Principais</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {characters.map((char) => (
                  <div key={char.character.mal_id} className="text-center">
                    <img
                      src={char.character.images.jpg.image_url}
                      alt={char.character.name}
                      className="w-full aspect-[3/4] object-cover object-top rounded-lg mb-2"
                    />
                    <h4 className="text-white text-sm font-semibold line-clamp-2">
                      {char.character.name}
                    </h4>
                    <p className="text-gray-400 text-xs">{char.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'comments' && (
            <CommentsSection animeId={animeId} />
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-8">
              {/* AI Recommendations */}
              <RecommendationEngine />
              
              {/* Similar Animes */}
              {recommendations.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-white mb-6">Animes Similares</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {recommendations.map((rec) => (
                      <Link key={rec.entry.mal_id} href={`/anime/${rec.entry.mal_id}`} className="cursor-pointer">
                        <div className="group">
                          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                            <img
                              src={rec.entry.images.jpg.image_url}
                              alt={rec.entry.title}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h4 className="text-white text-sm font-semibold mt-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                            {rec.entry.title}
                          </h4>
                          <p className="text-gray-400 text-xs">{rec.votes} recomendações</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Video Player */}
      {showPlayer && (
        <VideoPlayer
          animeId={animeId}
          episodeNumber={currentEpisode}
          episodeTitle={`${animeTitle} - Episódio ${currentEpisode}`}
          onClose={() => setShowPlayer(false)}
          onNext={currentEpisode < (anime.episodes || 12) ? () => setCurrentEpisode(prev => prev + 1) : undefined}
          onPrevious={currentEpisode > 1 ? () => setCurrentEpisode(prev => prev - 1) : undefined}
        />
      )}

      {/* Watch Party */}
      <WatchParty animeId={animeId} episodeNumber={currentEpisode} />

      {/* Trailer Modal */}
      {showTrailer && anime.trailer && anime.trailer.youtube_id && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-white text-xl font-bold">Trailer - {animeTitle}</h3>
              <button
                onClick={() => setShowTrailer(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={anime.trailer.embed_url}
                className="w-full h-full"
                allowFullScreen
                title={`Trailer ${animeTitle}`}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}