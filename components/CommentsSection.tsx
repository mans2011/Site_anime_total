
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { userStorage, commentStorage, Comment } from '../lib/userStorage';

interface CommentsSectionProps {
  animeId: number;
}

export default function CommentsSection({ animeId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(userStorage.getCurrentUser());

  useEffect(() => {
    loadComments();
  }, [animeId]);

  const loadComments = () => {
    const animeComments = commentStorage.getComments(animeId);
    setComments(animeComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comment = commentStorage.addComment(animeId, newComment.trim(), newRating || undefined);
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setNewRating(null);
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    commentStorage.deleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
            className={`text-lg ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-500'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            <i className="ri-star-fill"></i>
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-gray-900/30 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-white mb-6">
        Comentários ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-4">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva seu comentário sobre este anime..."
                className="w-full p-3 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
                rows={3}
                maxLength={500}
                required
              />
              <div className="text-right text-gray-400 text-xs mt-1">
                {newComment.length}/500
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">Avaliação:</span>
                  {renderStars(newRating || 0, true, setNewRating)}
                  {newRating && (
                    <button
                      type="button"
                      onClick={() => setNewRating(null)}
                      className="text-gray-400 hover:text-white text-xs cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Comentar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-6 text-center mb-8">
          <i className="ri-user-line text-4xl text-gray-400 mb-3"></i>
          <h4 className="text-white text-lg font-semibold mb-2">
            Faça login para comentar
          </h4>
          <p className="text-gray-400 mb-4">
            Entre na sua conta para compartilhar sua opinião sobre este anime
          </p>
          <a
            href="/login"
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-block cursor-pointer"
          >
            Fazer Login
          </a>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              {comment.userAvatar ? (
                <img 
                  src={comment.userAvatar} 
                  alt={comment.userName} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              ) : (
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-semibold">{comment.userName}</h4>
                    {comment.rating && renderStars(comment.rating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm" suppressHydrationWarning={true}>
                      {formatDistanceToNow(new Date(comment.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer"
                        title="Excluir comentário"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="ri-chat-3-line text-4xl text-gray-400 mb-3"></i>
          <h4 className="text-gray-300 text-lg mb-2">Nenhum comentário ainda</h4>
          <p className="text-gray-400">Seja o primeiro a comentar sobre este anime!</p>
        </div>
      )}
    </section>
  );
}
