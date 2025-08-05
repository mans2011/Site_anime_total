'use client';

import { useState, useRef, useEffect } from 'react';
import { userStorage } from '../lib/userStorage';

interface VideoPlayerProps {
  animeId: number;
  episodeNumber: number;
  episodeTitle: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function VideoPlayer({ 
  animeId, 
  episodeNumber, 
  episodeTitle, 
  onClose, 
  onNext, 
  onPrevious 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('1080p');
  
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simular carregamento do vídeo
    setDuration(1440); // 24 minutos em segundos
    
    // Salvar progresso de assistir
    const user = userStorage.getCurrentUser();
    if (user) {
      userStorage.addToWatchHistory(animeId, episodeNumber);
    }

    // Auto-hide controls
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [animeId, episodeNumber, isPlaying]);

  useEffect(() => {
    // Simular reprodução
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleQualityChange = (newQuality: string) => {
    setQuality(newQuality);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div ref={playerRef} className="flex-1 relative">
        {/* Vídeo simulado */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
          <div 
            className="text-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <i className={`ri-${isPlaying ? 'pause' : 'play'}-circle-line text-8xl text-white mb-4`}></i>
                <h3 className="text-white text-2xl font-bold mb-2">{episodeTitle}</h3>
                <p className="text-gray-400">Episódio {episodeNumber}</p>
                <p className="text-gray-500 text-sm mt-4">
                  🎬 Player de demonstração - Em produção seria integrado com serviços reais
                </p>
              </div>
            </div>
          </div>

          {/* Loading spinner */}
          {isPlaying && (
            <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Controles */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 cursor-pointer"
              >
                <i className={`ri-${isPlaying ? 'pause' : 'play'}-fill text-2xl`}></i>
              </button>

              {/* Previous/Next */}
              <div className="flex items-center gap-2">
                {onPrevious && (
                  <button
                    onClick={onPrevious}
                    className="text-white hover:text-red-500 cursor-pointer"
                  >
                    <i className="ri-skip-back-fill text-xl"></i>
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="text-white hover:text-red-500 cursor-pointer"
                  >
                    <i className="ri-skip-forward-fill text-xl"></i>
                  </button>
                )}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 cursor-pointer"
                >
                  <i className={`ri-volume-${isMuted || volume === 0 ? 'mute' : volume < 0.5 ? 'down' : 'up'}-fill text-xl`}></i>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Speed Control */}
              <div className="relative group">
                <button className="text-white hover:text-red-500 text-sm cursor-pointer">
                  {playbackRate}x
                </button>
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`block px-3 py-1 text-sm hover:bg-gray-800 cursor-pointer ${
                        playbackRate === rate ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="relative group">
                <button className="text-white hover:text-red-500 text-sm cursor-pointer">
                  <i className="ri-hd-fill mr-1"></i>
                  {quality}
                </button>
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {['720p', '1080p', '4K'].map(q => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`block px-3 py-1 text-sm hover:bg-gray-800 whitespace-nowrap cursor-pointer ${
                        quality === q ? 'text-red-500' : 'text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 cursor-pointer"
              >
                <i className={`ri-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}-fill text-xl`}></i>
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="text-white hover:text-red-500 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="bg-black/95 p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold">{episodeTitle}</h4>
            <p className="text-gray-400 text-sm">Episódio {episodeNumber}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="ri-eye-line"></i>
            <span>Assistindo agora</span>
          </div>
        </div>
      </div>
    </div>
  );
}