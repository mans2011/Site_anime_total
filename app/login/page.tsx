
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userStorage, User } from '../../lib/userStorage';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar se já está logado
  useEffect(() => {
    const currentUser = userStorage.getCurrentUser();
    if (currentUser) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          setError('Preencha todos os campos');
          setLoading(false);
          return;
        }

        const user = userStorage.findUserByEmail(formData.email.toLowerCase().trim());
        if (!user) {
          setError('Email ou senha incorretos');
          setLoading(false);
          return;
        }

        // Aqui você verificaria a senha (em um app real seria hash)
        userStorage.setCurrentUser(user);
        router.push('/');
      } else {
        // Registro
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('Preencha todos os campos');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Email inválido');
          setLoading(false);
          return;
        }

        const existingUser = userStorage.findUserByEmail(formData.email.toLowerCase().trim());
        if (existingUser) {
          setError('Este email já está em uso');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          watchlist: [],
          favorites: [],
          watchHistory: [],
          ratings: []
        };

        userStorage.setCurrentUser(newUser);
        router.push('/');
      }
    } catch (error) {
      console.error('Erro no login/registro:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); // Limpar erro ao digitar
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://readdy.ai/api/search-image?query=beautiful%20anime%20cityscape%20at%20night%20with%20neon%20lights%20and%20modern%20buildings%2C%20cyberpunk%20style%20urban%20landscape%2C%20colorful%20lighting%20effects%2C%20high%20quality%20digital%20art%20background&width=1920&height=1080&seq=login1&orientation=landscape')`
      }}
    >
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center text-red-600 text-2xl font-['Pacifico'] font-bold cursor-pointer">
          AnimeFlix
        </Link>
      </div>

      <div className="bg-black/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-gray-400">
            {isLogin 
              ? 'Entre para acessar sua conta' 
              : 'Crie sua conta e comece a assistir'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                placeholder="Digite seu nome"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
              placeholder="Digite sua senha"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                placeholder="Confirme sua senha"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <button
            onClick={switchMode}
            className="text-red-500 hover:text-red-400 font-semibold mt-1 cursor-pointer"
          >
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}
