import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      try {
        const parsedToken = JSON.parse(token)
        if (parsedToken.currentSession?.access_token) {
          config.headers.Authorization = `Bearer ${parsedToken.currentSession.access_token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('supabase.auth.token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Music API
export const musicAPI = {
  search: (query, type = 'all', page = 0) =>
    api.get(`/api/music/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`),
  
  getTrack: (id) =>
    api.get(`/api/music/track/${id}`),
  
  getTrackPlayInfo: (id) =>
    api.get(`/api/music/track/${id}/play`),
  
  getPlaylist: (id) =>
    api.get(`/api/music/playlist/${id}`),
  
  getAlbum: (id) =>
    api.get(`/api/music/album/${id}`),
  
  getArtist: (id) =>
    api.get(`/api/music/artist/${id}`),
  
  getChart: () =>
    api.get('/api/music/chart'),
}

// Favorites API
export const favoritesAPI = {
  getFavorites: () =>
    api.get('/api/favorites'),
  
  addToFavorites: (trackId, trackData) =>
    api.post('/api/favorites', { track_id: trackId, track_data: trackData }),
  
  removeFromFavorites: (id) =>
    api.delete(`/api/favorites/${id}`),
  
  checkFavorite: (trackId) =>
    api.get(`/api/favorites/check/${trackId}`),
}

// Playlists API
export const playlistsAPI = {
  getPlaylists: () =>
    api.get('/api/playlists'),
  
  getPlaylist: (id) =>
    api.get(`/api/playlists/${id}`),
  
  createPlaylist: (name, description, isPublic = false) =>
    api.post('/api/playlists', { name, description, is_public: isPublic }),
  
  updatePlaylist: (id, updates) =>
    api.put(`/api/playlists/${id}`, updates),
  
  deletePlaylist: (id) =>
    api.delete(`/api/playlists/${id}`),
  
  addTrackToPlaylist: (playlistId, track) =>
    api.post(`/api/playlists/${playlistId}/tracks`, { track }),
  
  removeTrackFromPlaylist: (playlistId, trackId) =>
    api.delete(`/api/playlists/${playlistId}/tracks/${trackId}`),
}

// User API
export const userAPI = {
  getUserProfile: () =>
    api.get('/api/auth/me'),
  
  updateProfile: (updates) =>
    api.post('/api/auth/profile', updates),
  
  getUserStats: () =>
    api.get('/api/user/stats'),
  
  getUserActivity: (limit = 10) =>
    api.get(`/api/user/activity?limit=${limit}`),
}

export default api