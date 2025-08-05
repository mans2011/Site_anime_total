'use client';

import { useState, useEffect } from 'react';
import { userStorage } from '../lib/userStorage';

interface WatchPartyProps {
  animeId: number;
  episodeNumber: number;
}

interface PartyMember {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'join' | 'leave' | 'reaction';
}

export default function WatchParty({ animeId, episodeNumber }: WatchPartyProps) {
  const [isPartyActive, setIsPartyActive] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [user, setUser] = useState(userStorage.getCurrentUser());

  useEffect(() => {
    setUser(userStorage.getCurrentUser());
    // Simular alguns membros na festa
    if (isPartyActive) {
      simulatePartyMembers();
    }
  }, [isPartyActive]);

  const createParty = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setPartyCode(code);
    setIsPartyActive(true);
    
    // Adicionar o host como primeiro membro
    const hostMember: PartyMember = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isHost: true,
      isOnline: true
    };
    
    setMembers([hostMember]);
    
    // Mensagem de sistema
    addSystemMessage(`🎉 Festa criada! Compartilhe o código: ${code}`);
  };

  const joinParty = (code: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setPartyCode(code);
    setIsPartyActive(true);
    simulatePartyMembers();
    addSystemMessage(`✨ ${user.name} entrou na festa!`);
  };

  const leaveParty = () => {
    setIsPartyActive(false);
    setPartyCode('');
    setMembers([]);
    setChatMessages([]);
  };

  const simulatePartyMembers = () => {
    const sampleMembers: PartyMember[] = [
      {
        id: '1',
        name: 'Ana Silva',
        isHost: false,
        isOnline: true
      },
      {
        id: '2',
        name: 'Carlos Santos',
        isHost: false,
        isOnline: true
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        isHost: false,
        isOnline: false
      }
    ];

    if (user) {
      sampleMembers.unshift({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: true,
        isOnline: true
      });
    }

    setMembers(sampleMembers);
  };

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'Sistema',
      message,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const sendReaction = (emoji: string) => {
    if (!user) return;

    const reaction: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      message: emoji,
      timestamp: new Date().toISOString(),
      type: 'reaction'
    };

    setChatMessages(prev => [...prev, reaction]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isPartyActive) {
    return (
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6">
        <div className="text-center">
          <i className="ri-group-line text-4xl text-purple-400 mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-4">🎬 Festa de Assistir</h3>
          <p className="text-gray-300 mb-6">
            Assista junto com seus amigos em tempo real! Sincronize a reprodução e converse no chat.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={createParty}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Criar Festa
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Código da festa"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={8}
                onChange={(e) => e.target.value.length === 8 && joinParty(e.target.value)}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Código da festa"]') as HTMLInputElement;
                  if (input?.value) joinParty(input.value);
                }}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors whitespace-nowrap cursor-pointer"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h4 className="text-white font-semibold">🎬 Festa</h4>
          <p className="text-gray-400 text-sm">Código: {partyCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <i className={`ri-chat-${showChat ? 'off' : 'on'}-line`}></i>
          </button>
          <button
            onClick={leaveParty}
            className="text-gray-400 hover:text-red-400 cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">
            Assistindo ({members.length})
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(partyCode)}
            className="text-purple-400 hover:text-purple-300 text-sm cursor-pointer"
          >
            <i className="ri-share-line mr-1"></i>
            Compartilhar
          </button>
        </div>
        
        <div className="flex -space-x-2">
          {members.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="relative"
              title={member.name}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-900 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-purple-600 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {member.isHost && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-gray-900"></div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-900 ${
                member.isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
            </div>
          ))}
          {members.length > 6 && (
            <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <span className="text-white text-xs">+{members.length - 6}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      {showChat && (
        <>
          <div className="h-48 overflow-y-auto p-4 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                <i className="ri-chat-3-line text-2xl mb-2"></i>
                <p>Nenhuma mensagem ainda</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.type === 'reaction' ? 'justify-center' : ''
                  }`}
                >
                  {msg.type === 'reaction' ? (
                    <div className="bg-gray-800 px-3 py-1 rounded-full">
                      <span className="text-2xl">{msg.message}</span>
                      <span className="text-gray-400 text-xs ml-2">{msg.userName}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">
                          {msg.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">
                            {msg.userName}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{msg.message}</p>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Reactions */}
          <div className="flex justify-center gap-2 p-2 border-t border-gray-700">
            {['😂', '❤️', '😮', '👏', '🔥', '😍'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-lg hover:scale-110 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <i className="ri-send-plane-line"></i>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}