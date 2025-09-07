import React, { useState } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import AddToPlaylistModal from './AddToPlaylistModal'
import toast from 'react-hot-toast'

const TrackCard = ({ track, showAddToPlaylist = false, onAddToPlaylist, className = '' }) => {
  const { currentTrack, isPlaying, playTrack, addToQueue } = usePlayer()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)
  const [isPlayingTrack, setIsPlayingTrack] = useState(false)
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)

  // Check if track is currently playing
  React.useEffect(() => {
    setIsPlayingTrack(currentTrack?.id === track.id && isPlaying)
  }, [currentTrack, isPlaying, track.id])

  // Check if track is in favorites
  React.useEffect(() => {
    if (user) {
      setIsCheckingFavorite(true)
      favoritesAPI.checkFavorite(track.id)
        .then(response => {
          setIsFavorite(response.data.is_favorite)
        })
        .catch(error => {
          console.error('Error checking favorite:', error)
        })
        .finally(() => {
          setIsCheckingFavorite(false)
        })
    }
  }, [track.id, user])

  const handlePlay = () => {
    if (isPlayingTrack) {
      // If this track is playing, we could pause it, but for simplicity, we'll just play it
      playTrack(track)
    } else {
      playTrack(track)
    }
  }

  const handleAddToQueue = () => {
    addToQueue([track])
    toast.success('Added to queue')
  }

  const toggleFavorite = async (e) => {
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to add favorites')
      return
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const favoritesResponse = await favoritesAPI.getFavorites()
        const favorite = favoritesResponse.data.find(f => f.track_id === track.id)
        if (favorite) {
          await favoritesAPI.removeFromFavorites(favorite.id)
          setIsFavorite(false)
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        await favoritesAPI.addToFavorites(track.id, track)
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error updating favorites')
    }
  }

  const handleAddToPlaylist = (e) => {
    e.stopPropagation()
    if (onAddToPlaylist) {
      onAddToPlaylist(track)
    } else {
      setShowAddToPlaylistModal(true)
    }
  }

  const formatDuration = (ms) => {
    if (!ms) return '0:00'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`group bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors cursor-pointer ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Album Cover */}
        <div className="relative w-12 h-12 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
          {track.cover ? (
            <img
              src={`https://${track.cover.replace('%%', '200x200')}`}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl text-dark-400">♪</span>
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePlay}
              className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPlayingTrack ? (
                <FaPause className="w-3 h-3" />
              ) : (
                <FaPlay className="w-3 h-3 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Track Info */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-white truncate">
            {track.title}
          </h4>
          <p className="text-xs text-dark-400 truncate">
            {track.artists?.map(artist => artist.name).join(', ')}
          </p>
          {track.album && (
            <p className="text-xs text-dark-500 truncate">
              {track.album.title}
            </p>
          )}
        </div>

        {/* Duration */}
        <div className="text-xs text-dark-400 flex-shrink-0">
          {formatDuration(track.duration)}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Add to Queue */}
          <button
            onClick={handleAddToQueue}
            className="p-2 text-dark-400 hover:text-white transition-colors"
            title="Add to queue"
          >
            <FaPlus className="w-3 h-3" />
          </button>

          {/* Favorite */}
          {user && (
            <button
              onClick={toggleFavorite}
              disabled={isCheckingFavorite}
              className="p-2 text-dark-400 hover:text-white transition-colors disabled:opacity-50"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isCheckingFavorite ? (
                <LoadingSpinner size="sm" />
              ) : isFavorite ? (
                <FaHeart className="w-3 h-3 text-red-500" />
              ) : (
                <FaRegHeart className="w-3 h-3" />
              )}
            </button>
          )}

          {/* Add to Playlist */}
          {showAddToPlaylist && (
            <button
              onClick={handleAddToPlaylist}
              className="p-2 text-dark-400 hover:text-white transition-colors"
              title="Add to playlist"
            >
              <FaPlus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && (
        <AddToPlaylistModal
          track={track}
          onClose={() => setShowAddToPlaylistModal(false)}
        />
      )}
    </div>
  )
}

export default TrackCard