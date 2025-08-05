'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { userStorage } from '../lib/userStorage';

interface Episode {
  numero: number;
  nome: string;
  imagem?: string;
  duracao?: string;
  dataLancamento?: string;
  assistido?: boolean;
}

interface EpisodesSectionProps {
  animeId: number;
  episodes: Episode[];
  totalEpisodes?: number;
}

export default function EpisodesList({ animeId, episodes, totalEpisodes }: EpisodesSectionProps) {
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set());
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [user, setUser] = useState(userStorage.getCurrentUser());

  useEffect(() => {
    const user = userStorage.getCurrentUser();
    setUser(user);
    if (user) {
      // Carregar episódios assistidos do localStorage
      const watched = localStorage.getItem(`watched_${animeId}_${user.id}`);
      if (watched) {
        setWatchedEpisodes(new Set(JSON.parse(watched)));
      }
    }
  }, [animeId]);

  const markAsWatched = (episodeNumber: number) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const newWatched = new Set(watchedEpisodes);
    if (newWatched.has(episodeNumber)) {
      newWatched.delete(episodeNumber);
    } else {
      newWatched.add(episodeNumber);
      userStorage.addToWatchHistory(animeId, episodeNumber);
    }
    
    setWatchedEpisodes(newWatched);
    localStorage.setItem(`watched_${animeId}_${user.id}`, JSON.stringify([...newWatched]));
  };

  const playEpisode = (episodeNumber: number) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    markAsWatched(episodeNumber);
    // Aqui seria integrado um player real
    alert(`Reproduzindo Episódio ${episodeNumber}\\n\\nEm uma implementação real, aqui abriria o player de vídeo.`);
  };

  const watchedCount = watchedEpisodes.size;
  const progressPercentage = totalEpisodes ? (watchedCount / totalEpisodes) * 100 : 0;

  return (
    <div className="bg-gray-900/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          Episódios {totalEpisodes && `(${totalEpisodes})`}
        </h3>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Progresso: {watchedCount}/{totalEpisodes || episodes.length} episódios
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-film-line text-4xl text-gray-400 mb-4"></i>
          <h4 className="text-gray-300 text-lg mb-2">Episódios não disponíveis</h4>
          <p className="text-gray-400">
            Os episódios deste anime ainda não foram catalogados em nossa base de dados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((episode, index) => {
            const episodeNumber = episode.numero || index + 1;
            const isWatched = watchedEpisodes.has(episodeNumber);
            
            return (
              <div
                key={episodeNumber}
                className={`group bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors ${
                  isWatched ? 'ring-2 ring-green-500/50' : ''
                }`}
              >
                <div className="relative aspect-video bg-gray-700">
                  {episode.imagem ? (
                    <img
                      src={episode.imagem}
                      alt={`Episódio ${episodeNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <i className="ri-play-circle-line text-4xl text-gray-500"></i>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => playEpisode(episodeNumber)}
                      className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <i className="ri-play-fill text-xl"></i>
                    </button>
                  </div>

                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                    EP {episodeNumber}
                  </div>

                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-sm"></i>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="text-white font-semibold mb-2 line-clamp-2">
                    {episode.nome || `Episódio ${episodeNumber}`}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    {episode.duracao && (
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        {episode.duracao}
                      </span>
                    )}
                    {episode.dataLancamento && (
                      <span suppressHydrationWarning={true}>
                        {formatDistanceToNow(new Date(episode.dataLancamento), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => playEpisode(episodeNumber)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-play-line mr-1"></i>
                      Assistir
                    </button>
                    
                    {user && (
                      <button
                        onClick={() => markAsWatched(episodeNumber)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors cursor-pointer ${
                          isWatched
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={isWatched ? 'Marcar como não assistido' : 'Marcar como assistido'}
                      >
                        <i className={`ri-${isWatched ? 'eye-off' : 'eye'}-line`}></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}