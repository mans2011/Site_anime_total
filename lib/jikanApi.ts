
// 🌐 Endpoints base
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const ANILIST_GRAPHQL = 'https://graphql.anilist.co';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = '7d779743f4eacd1de7ffc7882da6d63f'; // substitua pela sua chave válida da TMDB!

export interface Anime {
  mal_id: number;
  title: string | { romaji?: string; english?: string; native?: string };
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url: string;
      small_image_url?: string;
      large_image_url?: string;
    };
  };
  synopsis: string;
  score?: number;
  averageScore?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  status: string;
  rating?: string;
  source?: string;
  episodes?: number;
  duration?: string;
  year?: number;
  season?: string;
  studios?: Array<{ mal_id: number; name: string }>;
  genres?: Array<{ mal_id: number; name: string }>;
  demographics?: Array<{ mal_id: number; name: string }>;
  themes?: Array<{ mal_id: number; name: string }>;
  aired?: {
    from: string;
    to: string;
    string: string;
  };
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
  bannerImage?: string;
}

export interface AnimeCharacter {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
}

export interface AnimeRecommendation {
  entry: {
    mal_id: number;
    title: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  votes: number;
}

export interface Genre {
  mal_id: number;
  name: string;
}

// 🔹 Buscar anime por nome (Jikan)
export async function buscarPorNome(nome: string): Promise<Anime[]> {
  try {
    const res = await fetch(
      `${JIKAN_BASE}/anime?q=${encodeURIComponent(nome)}&order_by=popularity`
    );
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Erro ao buscar por nome:', error);
    return [];
  }
}

// 🔹 Buscar anime por ID (primeiro Jikan, depois AniList como fallback)
export async function buscarPorId(id: number): Promise<Anime | null> {
  // Tenta Jikan primeiro
  try {
    const resJikan = await fetch(`${JIKAN_BASE}/anime/${id}`);
    if (resJikan.ok) {
      const jsonJikan = await resJikan.json();
      if (jsonJikan.data) {
        return normalizeAnimeData(jsonJikan.data);
      }
    }
  } catch (err) {
    console.warn('Jikan falhou, tentando AniList…', err);
  }

  // Fallback: AniList GraphQL
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          description(asHtml: false)
          episodes
          status
          coverImage { large }
          averageScore
          genres { name }
          studios { name }
        }
      }
    `;
    const resAni = await fetch(ANILIST_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { id: parseInt(id.toString(), 10) }
      })
    });
    const jsonAni = await resAni.json();
    const media = jsonAni.data?.Media;
    if (!media) return null;

    // Normalizar resposta para mesma estrutura do Jikan
    return normalizeAnimeData({
      mal_id: media.id,
      title: media.title.english || media.title.romaji || media.title.native,
      title_english: media.title.english,
      title_japanese: media.title.native,
      bannerImage: media.bannerImage,
      images: { 
        jpg: { 
          image_url: media.coverImage.large,
          large_image_url: media.coverImage.large 
        } 
      },
      synopsis: media.description,
      episodes: media.episodes,
      status: media.status,
      score: media.averageScore ? media.averageScore / 10 : undefined,
      genres: media.genres || [],
      studios: media.studios || []
    });
  } catch (err) {
    console.error('AniList fallback falhou:', err);
    return null;
  }
}

// 🔹 Buscar lista de gêneros (Jikan)
export async function buscarGeneros(): Promise<Genre[]> {
  try {
    const res = await fetch(`${JIKAN_BASE}/genres/anime`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    return [];
  }
}

// 🔹 Buscar por nome de gênero (Jikan)
export async function buscarPorGenero(nomeGenero: string): Promise<Anime[]> {
  try {
    const generos = await buscarGeneros();
    const genero = generos.find(
      g => g.name.toLowerCase() === nomeGenero.toLowerCase()
    );
    if (!genero) return [];

    const res = await fetch(
      `${JIKAN_BASE}/anime?genres=${genero.mal_id}&limit=20`
    );
    const json = await res.json();
    return (json.data || []).map(normalizeAnimeData);
  } catch (error) {
    console.error('Erro ao buscar por gênero:', error);
    return [];
  }
}

// 🔹 Buscar animes mais populares (Jikan)
export async function buscarMaisVistos(limit = 10): Promise<Anime[]> {
  try {
    const res = await fetch(
      `${JIKAN_BASE}/top/anime?filter=bypopularity&limit=${limit}`
    );
    const json = await res.json();
    return (json.data || []).map(normalizeAnimeData);
  } catch (error) {
    console.error('Erro ao buscar mais vistos:', error);
    return [];
  }
}

// 🔹 Buscar top avaliados (Jikan)
export async function buscarTopAvaliados(limit = 10): Promise<Anime[]> {
  try {
    const res = await fetch(
      `${JIKAN_BASE}/top/anime?limit=${limit}`
    );
    const json = await res.json();
    return (json.data || []).map(normalizeAnimeData);
  } catch (error) {
    console.error('Erro ao buscar top avaliados:', error);
    return [];
  }
}

// 🔹 Buscar temporada atual (Jikan)
export async function buscarTemporadaAtual(): Promise<Anime[]> {
  try {
    const res = await fetch(`${JIKAN_BASE}/seasons/now`);
    const json = await res.json();
    return (json.data || []).map(normalizeAnimeData);
  } catch (error) {
    console.error('Erro ao buscar temporada atual:', error);
    return [];
  }
}

// 🔹 Buscar avatar aleatório (Jikan - personagens)
export async function buscarAvatarAleatorio(): Promise<string | null> {
  try {
    const pagina = Math.floor(Math.random() * 10) + 1;
    const res = await fetch(`${JIKAN_BASE}/characters?page=${pagina}`);
    const json = await res.json();
    const lista = json.data || [];
    const personagem = lista[Math.floor(Math.random() * lista.length)];
    return personagem?.images?.jpg?.image_url || null;
  } catch (err) {
    console.error('Erro ao buscar avatar:', err);
    return null;
  }
}

// 🔸 Buscar sinopse em português (TMDB)
export async function buscarSinopsePT(tituloOriginal: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}` +
      `&query=${encodeURIComponent(tituloOriginal)}` +
      `&language=pt-BR`
    );
    const json = await res.json();
    const serie = json.results?.[0];
    if (!serie) return null;

    const detalhes = await fetch(
      `${TMDB_BASE}/tv/${serie.id}` +
      `?api_key=${TMDB_KEY}&language=pt-BR`
    );
    const jsonDetalhes = await detalhes.json();
    return jsonDetalhes.overview?.trim() || null;
  } catch (err) {
    console.error('Erro na sinopse PT:', err);
    return null;
  }
}

// 🔸 Buscar temporadas e episódios (TMDB)
export async function buscarDetalhesSerie(tituloOriginal: string): Promise<any | null> {
  try {
    const busca = await fetch(
      `${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}` +
      `&query=${encodeURIComponent(tituloOriginal)}` +
      `&language=pt-BR`
    );
    const jsonBusca = await busca.json();
    const serie = jsonBusca.results?.[0];
    if (!serie) return null;

    const detalhes = await fetch(
      `${TMDB_BASE}/tv/${serie.id}` +
      `?api_key=${TMDB_KEY}&language=pt-BR`
    );
    const jsonDetalhes = await detalhes.json();

    const temporadas = [];
    for (const temp of jsonDetalhes.seasons) {
      const urlEps =
        `${TMDB_BASE}/tv/${serie.id}/season/${temp.season_number}` +
        `?api_key=${TMDB_KEY}&language=pt-BR`;
      const resEps = await fetch(urlEps);
      const jsonEps = await resEps.json();

      temporadas.push({
        nome: temp.name,
        numero: temp.season_number,
        episodios: jsonEps.episodes.map((ep: any) => ({
          numero: ep.episode_number,
          nome: ep.name,
          imagem: ep.still_path
            ? `https://image.tmdb.org/t/p/w185${ep.still_path}`
            : null
        }))
      });
    }

    return {
      temporadas,
      episodiosTotal: jsonDetalhes.number_of_episodes,
      nomeOriginal: jsonDetalhes.original_name,
      status: jsonDetalhes.status,
      primeiroEp: jsonDetalhes.first_air_date
    };
  } catch (err) {
    console.error('Erro nos detalhes da série:', err);
    return null;
  }
}

// Função auxiliar para normalizar dados de anime
function normalizeAnimeData(anime: any): Anime {
  return {
    mal_id: anime.mal_id,
    title: typeof anime.title === 'string' ? anime.title : anime.title?.english || anime.title?.romaji || anime.title?.native,
    title_english: anime.title_english || (typeof anime.title === 'object' ? anime.title?.english : undefined),
    title_japanese: anime.title_japanese || (typeof anime.title === 'object' ? anime.title?.native : undefined),
    images: anime.images || { jpg: { image_url: '' } },
    synopsis: anime.synopsis || anime.description || '',
    score: anime.score || anime.averageScore,
    scored_by: anime.scored_by,
    rank: anime.rank,
    popularity: anime.popularity,
    members: anime.members,
    favorites: anime.favorites,
    status: anime.status || 'Unknown',
    rating: anime.rating,
    source: anime.source,
    episodes: anime.episodes,
    duration: anime.duration,
    year: anime.year || anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined,
    season: anime.season,
    studios: anime.studios,
    genres: anime.genres,
    demographics: anime.demographics,
    themes: anime.themes,
    aired: anime.aired,
    trailer: anime.trailer,
    bannerImage: anime.bannerImage
  };
}

// Compatibilidade com código existente
export const jikanApi = {
  async getTopAnimes(page = 1, limit = 24) {
    const animes = await buscarTopAvaliados(limit);
    return { data: animes };
  },

  async getSeasonalAnimes() {
    const animes = await buscarTemporadaAtual();
    return { data: animes.slice(0, 24) };
  },

  async searchAnimes(query: string, page = 1) {
    const animes = await buscarPorNome(query);
    return { data: animes.slice(0, 24) };
  },

  async getAnimeById(id: number) {
    return await buscarPorId(id);
  },

  async getAnimeCharacters(id: number) {
    try {
      const response = await fetch(`${JIKAN_BASE}/anime/${id}/characters`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar personagens:', error);
      return [];
    }
  },

  async getAnimeRecommendations(id: number) {
    try {
      const response = await fetch(`${JIKAN_BASE}/anime/${id}/recommendations`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      return [];
    }
  },

  async getAnimesByGenre(genreId: number, page = 1) {
    try {
      const response = await fetch(`${JIKAN_BASE}/anime?genres=${genreId}&page=${page}&limit=24`);
      const data = await response.json();
      return { data: (data.data || []).map(normalizeAnimeData) };
    } catch (error) {
      console.error('Erro ao buscar animes por gênero:', error);
      return { data: [] };
    }
  }
};
