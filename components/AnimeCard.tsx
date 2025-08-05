
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Anime } from '../lib/jikanApi';
import { userStorage } from '../lib/userStorage';

interface AnimeCardProps {
  anime: Anime;
  onWatchlistChange?: () => void;
}

export default function AnimeCard({ anime, onWatchlistChange }: AnimeCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(() => {
    const user = userStorage.getCurrentUser();
    return user ? user.watchlist.includes(anime.mal_id) : false;
  });
  
  const [isInFavorites, setIsInFavorites] = useState(() => {
    const user = userStorage.getCurrentUser();
    return user ? user.favorites.includes(anime.mal_id) : false;
  });

  const getAnimeTitle = (): string => {
    if (typeof anime.title === 'string') return anime.title;
    return anime.title_english || anime.title_japanese || 'Título não disponível';
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isInWatchlist) {
      userStorage.removeFromWatchlist(anime.mal_id);
      setIsInWatchlist(false);
    } else {
      userStorage.addToWatchlist(anime.mal_id);
      setIsInWatchlist(true);
    }
    
    onWatchlistChange?.();
  };

  const handleFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = userStorage.getCurrentUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isInFavorites) {
      userStorage.removeFromFavorites(anime.mal_id);
      setIsInFavorites(false);
    } else {
      userStorage.addToFavorites(anime.mal_id);
      setIsInFavorites(true);
    }
    
    onWatchlistChange?.();
  };

  const animeTitle = getAnimeTitle();

  return (
    <Link href={`/anime/${anime.mal_id}`} className="group cursor-pointer">
      <div className="relative">
        <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-800">
          <img
            src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
            alt={animeTitle}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={handleWatchlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isInWatchlist 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black/60 text-white hover:bg-blue-600'
              }`}
              title={isInWatchlist ? 'Remover da lista' : 'Adicionar à lista'}
            >
              <i className={`ri-bookmark-${isInWatchlist ? 'fill' : 'line'} text-sm`}></i>
            </button>
            
            <button
              onClick={handleFavorites}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isInFavorites 
                  ? 'bg-red-600 text-white' 
                  : 'bg-black/60 text-white hover:bg-red-600'
              }`}
              title={isInFavorites ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <i className={`ri-heart-${isInFavorites ? 'fill' : 'line'} text-sm`}></i>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-white text-xs mb-2">
              {anime.score && (
                <div className="flex items-center">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span>{anime.score}</span>
                </div>
              )}
              {anime.year && (
                <>
                  <span>•</span>
                  <span>{anime.year}</span>
                </>
              )}
              {anime.episodes && (
                <>
                  <span>•</span>
                  <span>{anime.episodes} eps</span>
                </>
              )}
            </div>
            
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.mal_id || genre.name}
                    className="bg-red-600/80 text-white px-2 py-1 rounded text-xs"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
            {animeTitle}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            {anime.score && (
              <div className="flex items-center">
                <i className="ri-star-fill text-yellow-400 mr-1"></i>
                <span>{anime.score}</span>
              </div>
            )}
            {anime.status && (
              <>
                <span>•</span>
                <span className="capitalize">{anime.status}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
