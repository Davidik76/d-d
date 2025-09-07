import React, { useState, useEffect } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeUp, 
  FaVolumeMute,
  FaHeart,
  FaRegHeart,
  FaRandom,
  FaRedo,
  FaList
} from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const MusicPlayer = () => {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    isLoading,
    volume,
    currentTime,
    duration,
    repeat,
    shuffle,
    playPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
  } = usePlayer()

  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)

  // Check if current track is in favorites
  useEffect(() => {
    if (currentTrack && user) {
      setIsCheckingFavorite(true)
      favoritesAPI.checkFavorite(currentTrack.id)
        .then(response => {
          setIsFavorite(response.data.is_favorite)
        })
        .catch(error => {
          console.error('Error checking favorite:', error)
        })
        .finally(() => {
          setIsCheckingFavorite(false)
        })
    } else {
      setIsFavorite(false)
    }
  }, [currentTrack, user])

  const handlePlayPause = () => {
    playPause()
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    seekTo(newTime)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to add favorites')
      return
    }

    if (!currentTrack) return

    try {
      if (isFavorite) {
        // Remove from favorites - we need to get the favorite ID first
        const favoritesResponse = await favoritesAPI.getFavorites()
        const favorite = favoritesResponse.data.find(f => f.track_id === currentTrack.id)
        if (favorite) {
          await favoritesAPI.removeFromFavorites(favorite.id)
          setIsFavorite(false)
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        await favoritesAPI.addToFavorites(currentTrack.id, currentTrack)
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Error updating favorites')
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'all':
        return <FaRedo className="w-4 h-4" />
      case 'one':
        return <FaRedo className="w-4 h-4" />
      default:
        return <FaRedo className="w-4 h-4 opacity-50" />
    }
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-dark-700 rounded-lg flex-shrink-0 overflow-hidden">
              {currentTrack.cover ? (
                <img
                  src={`https://${currentTrack.cover.replace('%%', '200x200')}`}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">♪</span>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-white truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-dark-400 truncate">
                {currentTrack.artists?.map(artist => artist.name).join(', ')}
              </p>
            </div>

            {/* Favorite Button */}
            {user && (
              <button
                onClick={toggleFavorite}
                disabled={isCheckingFavorite}
                className="p-2 text-dark-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isCheckingFavorite ? (
                  <LoadingSpinner size="sm" />
                ) : isFavorite ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FaRegHeart className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            {/* Main Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition-colors ${
                  shuffle ? 'text-primary-400' : 'text-dark-400 hover:text-white'
                }`}
              >
                <FaRandom className="w-4 h-4" />
              </button>

              <button
                onClick={previousTrack}
                disabled={queue.length <= 1}
                className="p-2 text-dark-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaStepBackward className="w-4 h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isPlaying ? (
                  <FaPause className="w-4 h-4" />
                ) : (
                  <FaPlay className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={nextTrack}
                disabled={queue.length <= 1}
                className="p-2 text-dark-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaStepForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 transition-colors ${
                  repeat !== 'none' ? 'text-primary-400' : 'text-dark-400 hover:text-white'
                }`}
              >
                {getRepeatIcon()}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-dark-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div
                className="flex-1 h-1 bg-dark-700 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div className="relative h-full">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-200"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, marginLeft: '-6px' }}
                  />
                </div>
              </div>
              
              <span className="text-xs text-dark-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume and Queue */}
          <div className="flex items-center space-x-3">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 1)}
                className="p-2 text-dark-400 hover:text-white transition-colors"
              >
                {volume > 0 ? (
                  <FaVolumeUp className="w-4 h-4" />
                ) : (
                  <FaVolumeMute className="w-4 h-4" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Queue Button */}
            {queue.length > 0 && (
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="p-2 text-dark-400 hover:text-white transition-colors"
                title={`Queue (${queue.length} tracks)`}
              >
                <FaList className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Queue Panel */}
        {showQueue && queue.length > 0 && (
          <div className="mt-3 pt-3 border-t border-dark-700">
            <div className="max-h-48 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                {queue.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      index === currentIndex
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'hover:bg-dark-700'
                    }`}
                  >
                    <div className="w-8 h-8 bg-dark-700 rounded flex-shrink-0 overflow-hidden">
                      {track.cover ? (
                        <img
                          src={`https://${track.cover.replace('%%', '100x100')}`}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">♪</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-dark-400 truncate">
                        {track.artists?.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                    
                    {index === currentIndex && isPlaying && (
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MusicPlayer