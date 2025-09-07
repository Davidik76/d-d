import React from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { usePlayer } from '../contexts/PlayerContext'
import { favoritesAPI } from '../services/api'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FaHeart, FaPlay, FaSignInAlt } from 'react-icons/fa'

const Favorites = () => {
  const { user } = useAuth()
  const { playTrack } = usePlayer()

  const { data: favorites, isLoading, error, refetch } = useQuery(
    'favorites',
    () => favoritesAPI.getFavorites(),
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const handlePlayAll = () => {
    const tracks = favorites?.data?.map(fav => fav.track_data).filter(Boolean) || []
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <FaSignInAlt className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-dark-400 mb-6">
            Please sign in to view your favorite tracks
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FaHeart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Favorites</h1>
          </div>
          
          {favorites?.data && favorites.data.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FaPlay className="w-4 h-4" />
              <span>Play All</span>
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Error loading favorites: {error.message}</p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : !favorites?.data || favorites.data.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
            <p className="text-dark-400 mb-6">
              Start adding tracks to your favorites by clicking the heart icon on any track
            </p>
            <button
              onClick={() => window.location.href = '/search'}
              className="btn btn-primary"
            >
              Discover Music
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-dark-400">
                {favorites.data.length} favorite track{favorites.data.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid gap-4">
              {favorites.data.map((favorite) => (
                <TrackCard
                  key={favorite.id}
                  track={favorite.track_data}
                  showAddToPlaylist={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites