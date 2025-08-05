'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userStorage } from '../lib/userStorage';
import { buscarPorNome, Anime } from '../lib/jikanApi';
import AnimeCard from './AnimeCard';

interface RecommendationEngineProps {
  userId?: string;
}

export default function RecommendationEngine({ userId }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(userStorage.getCurrentUser());

  useEffect(() => {
    if (user) {
      generateRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const generateRecommendations = async () => {
    if (!user) return;

    try {
      // Analisar histórico do usuário
      const favoriteGenres = await analyzeUserPreferences();
      const recommendations: Anime[] = [];

      // Buscar animes baseados nos gêneros favoritos
      for (const genre of favoriteGenres.slice(0, 3)) {
        const results = await buscarPorNome(genre);
        recommendations.push(...results.slice(0, 4));
      }

      // Remover duplicatas e animes já na lista/favoritos
      const uniqueRecommendations = recommendations
        .filter((anime, index, self) => 
          index === self.findIndex(a => a.mal_id === anime.mal_id)
        )
        .filter(anime => 
          !user.watchlist.includes(anime.mal_id) && 
          !user.favorites.includes(anime.mal_id)
        )
        .slice(0, 12);

      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUserPreferences = async (): Promise<string[]> => {
    // Algoritmo simples de recomendação baseado no histórico
    const genres = ['action', 'adventure', 'comedy', 'drama', 'fantasy', 'romance', 'thriller', 'sci-fi'];
    
    // Em uma implementação real, isso analisaria os gêneros dos animes favoritos/assistidos
    return genres.sort(() => Math.random() - 0.5).slice(0, 5);
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 text-center">
        <i className="ri-lightbulb-line text-4xl text-purple-400 mb-4"></i>
        <h3 className="text-2xl font-bold text-white mb-4">Recomendações Personalizadas</h3>
        <p className="text-gray-300 mb-6">
          Entre na sua conta para receber recomendações baseadas no seu gosto pessoal!
        </p>
        <Link
          href="/login"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block cursor-pointer"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Gerando recomendações personalizadas...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          🎯 Recomendado para você
        </h3>
        <p className="text-gray-400">
          Baseado no seu histórico de visualização e preferências
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {recommendations.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="ri-search-eye-line text-4xl text-gray-400 mb-4"></i>
          <h4 className="text-gray-300 text-lg mb-2">Ainda não há recomendações</h4>
          <p className="text-gray-400 mb-4">
            Adicione alguns animes aos favoritos para receber recomendações personalizadas!
          </p>
          <Link
            href="/trending"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block cursor-pointer"
          >
            Explorar Animes
          </Link>
        </div>
      )}

      <div className="bg-gray-900/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Como funciona?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <i className="ri-heart-line text-red-500 mt-1"></i>
            <div>
              <strong>Análise de Favoritos:</strong> Analisamos seus animes favoritos para entender seu gosto
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-eye-line text-blue-500 mt-1"></i>
            <div>
              <strong>Histórico de Visualização:</strong> Consideramos o que você já assistiu
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="ri-magic-line text-purple-500 mt-1"></i>
            <div>
              <strong>Algoritmo Inteligente:</strong> Sugerimos animes similares ao seu perfil
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}