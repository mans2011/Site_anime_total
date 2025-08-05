
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  watchlist: number[];
  favorites: number[];
  watchHistory: Array<{
    animeId: number;
    watchedAt: string;
    episodeNumber?: number;
  }>;
  ratings: Array<{
    animeId: number;
    rating: number;
    ratedAt: string;
  }>;
}

export interface Comment {
  id: string;
  animeId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  rating?: number;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'animeflix_current_user',
  USERS: 'animeflix_users',
  COMMENTS: 'animeflix_comments'
};

export const userStorage = {
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser(user: User | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.saveUser(user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  saveUser(user: User) {
    if (typeof window === 'undefined') return;
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getAllUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersData ? JSON.parse(usersData) : [];
  },

  findUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  },

  addToWatchlist(animeId: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.watchlist.includes(animeId)) {
      user.watchlist.push(animeId);
      this.setCurrentUser(user);
    }
  },

  removeFromWatchlist(animeId: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    user.watchlist = user.watchlist.filter(id => id !== animeId);
    this.setCurrentUser(user);
  },

  addToFavorites(animeId: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.favorites.includes(animeId)) {
      user.favorites.push(animeId);
      this.setCurrentUser(user);
    }
  },

  removeFromFavorites(animeId: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    user.favorites = user.favorites.filter(id => id !== animeId);
    this.setCurrentUser(user);
  },

  addToWatchHistory(animeId: number, episodeNumber?: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    const existingIndex = user.watchHistory.findIndex(h => h.animeId === animeId);
    const historyEntry = {
      animeId,
      watchedAt: new Date().toISOString(),
      episodeNumber
    };

    if (existingIndex >= 0) {
      user.watchHistory[existingIndex] = historyEntry;
    } else {
      user.watchHistory.unshift(historyEntry);
    }

    if (user.watchHistory.length > 100) {
      user.watchHistory = user.watchHistory.slice(0, 100);
    }

    this.setCurrentUser(user);
  },

  rateAnime(animeId: number, rating: number) {
    const user = this.getCurrentUser();
    if (!user) return;

    const existingIndex = user.ratings.findIndex(r => r.animeId === animeId);
    const ratingEntry = {
      animeId,
      rating,
      ratedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      user.ratings[existingIndex] = ratingEntry;
    } else {
      user.ratings.push(ratingEntry);
    }

    this.setCurrentUser(user);
  },

  getUserRating(animeId: number): number | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const rating = user.ratings.find(r => r.animeId === animeId);
    return rating ? rating.rating : null;
  }
};

export const commentStorage = {
  getComments(animeId: number): Comment[] {
    if (typeof window === 'undefined') return [];
    const commentsData = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
    return allComments.filter(c => c.animeId === animeId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addComment(animeId: number, text: string, rating?: number): Comment | null {
    if (typeof window === 'undefined') return null;
    const user = userStorage.getCurrentUser();
    if (!user) return null;

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      animeId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text,
      rating,
      createdAt: new Date().toISOString()
    };

    const commentsData = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
    allComments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));

    if (rating) {
      userStorage.rateAnime(animeId, rating);
    }

    return comment;
  },

  deleteComment(commentId: string) {
    if (typeof window === 'undefined') return;
    const user = userStorage.getCurrentUser();
    if (!user) return;

    const commentsData = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const allComments: Comment[] = commentsData ? JSON.parse(commentsData) : [];
    const updatedComments = allComments.filter(c => 
      c.id !== commentId || c.userId === user.id
    );
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updatedComments));
  }
};
