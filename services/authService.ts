import { supabase } from '@/lib/supabaseClient';
import { userStorage, User } from '@/lib/userStorage';

// Salva os dados do localStorage no Supabase na tabela profiles, coluna id = userId
async function saveLocalStorageToSupabase(userId: string) {
  const localUserData = userStorage.getCurrentUser();
  if (!localUserData) return;

  // Atualiza o perfil do usuário com os dados locais
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: localUserData.name,
      email: localUserData.email,
      avatar: localUserData.avatar || null,
      watchlist: localUserData.watchlist,
      favorites: localUserData.favorites,
      watchHistory: localUserData.watchHistory,
      ratings: localUserData.ratings,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Erro ao salvar dados no Supabase:', error);
  }
}

// Busca dados do Supabase na tabela profiles e atualiza localStorage
async function syncUserDataFromSupabase(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, avatar, watchlist, favorites, watchHistory, ratings')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar dados do usuário no Supabase:', error);
    return;
  }

  if (data) {
    const userData: User = {
      id: userId,
      name: data.full_name || '',
      email: data.email || '',
      avatar: data.avatar || '',
      watchlist: data.watchlist || [],
      favorites: data.favorites || [],
      watchHistory: data.watchHistory || [],
      ratings: data.ratings || []
    };

    userStorage.setCurrentUser(userData);
  }
}

// Função para login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (!data.user) throw new Error('Usuário não encontrado após login');

  const userId = data.user.id;

  // Sincroniza localStorage com dados do Supabase (para pegar nome, email, etc)
  await syncUserDataFromSupabase(userId);

  return data.user;
}

// Função para criar usuário
export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });
  if (error) throw error;

  if (!data.user) throw new Error('Usuário não encontrado após cadastro');

  const userId = data.user.id;

  // Cria dados básicos no Supabase na tabela profiles já com full_name e email
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: name,
      email: email,
      watchlist: [],
      favorites: [],
      watchHistory: [],
      ratings: [],
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    console.error('Erro ao criar perfil no Supabase:', upsertError);
  }

  // Atualiza localStorage com os dados do novo usuário
  const newUser: User = {
    id: userId,
    name,
    email,
    avatar: '',
    watchlist: [],
    favorites: [],
    watchHistory: [],
    ratings: []
  };

  userStorage.setCurrentUser(newUser);

  return data.user;
}

// Função para logout
export async function signOut() {
  await supabase.auth.signOut();
  userStorage.setCurrentUser(null);
}
