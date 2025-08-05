
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userStorage, User } from '../lib/userStorage';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setUser(userStorage.getCurrentUser());
    
    // Listener para mudanças no localStorage (quando login/logout acontece)
    const handleStorageChange = () => {
      setUser(userStorage.getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudanças periodicamente (para mudanças na mesma aba)
    const interval = setInterval(() => {
      const currentUser = userStorage.getCurrentUser();
      setUser(currentUser);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    userStorage.setCurrentUser(null);
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="bg-black/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <span className="text-red-600 text-2xl font-['Pacifico'] font-bold">AnimeFlix</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-red-500 transition-colors whitespace-nowrap cursor-pointer">
                Início
              </Link>
              <Link href="/trending" className="text-white hover:text-red-500 transition-colors whitespace-nowrap cursor-pointer">
                Em Alta
              </Link>
              <Link href="/genres" className="text-white hover:text-red-500 transition-colors whitespace-nowrap cursor-pointer">
                Gêneros
              </Link>
              {user && (
                <>
                  <Link href="/watchlist" className="text-white hover:text-red-500 transition-colors whitespace-nowrap cursor-pointer">
                    Minha Lista
                  </Link>
                  <Link href="/favorites" className="text-white hover:text-red-500 transition-colors whitespace-nowrap cursor-pointer">
                    Favoritos
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar animes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i className="ri-search-line text-gray-400 hover:text-white cursor-pointer"></i>
                </button>
              </div>
            </form>

            {user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-red-500 cursor-pointer"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="hidden md:block">{user.name.split(' ')[0]}</span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <Link href="/watchlist" className="block px-4 py-2 text-white hover:bg-gray-800 cursor-pointer">
                      <i className="ri-bookmark-line mr-2"></i>
                      Minha Lista ({user.watchlist.length})
                    </Link>
                    <Link href="/favorites" className="block px-4 py-2 text-white hover:bg-gray-800 cursor-pointer">
                      <i className="ri-heart-line mr-2"></i>
                      Favoritos ({user.favorites.length})
                    </Link>
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 cursor-pointer"
                      >
                        <i className="ri-logout-box-line mr-2"></i>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
