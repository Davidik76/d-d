import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { usePlayer } from '../contexts/PlayerContext'
import { playlistsAPI } from '../services/api'
import TrackCard from '../components/TrackCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FaArrowLeft, FaPlay, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'

const PlaylistDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { playTrack } = usePlayer()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: playlist, isLoading, error, refetch } = useQuery(
    ['playlist', id],
    () => playlistsAPI.getPlaylist(id),
    {
      enabled: !!id,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const handlePlayAll = () => {
    const tracks = playlist?.data?.tracks || []
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await playlistsAPI.deletePlaylist(id)
      toast.success('Playlist deleted successfully')
      navigate('/playlists')
    } catch (error) {
      console.error('Error deleting playlist:', error)
      toast.error('Error deleting playlist')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveTrack = async (trackId) => {
    try {
      await playlistsAPI.removeTrackFromPlaylist(id, trackId)
      toast.success('Track removed from playlist')
      refetch()
    } catch (error) {
      console.error('Error removing track:', error)
      toast.error('Error removing track')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading playlist: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!playlist?.data) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Playlist not found</p>
          <button
            onClick={() => navigate('/playlists')}
            className="btn btn-primary"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    )
  }

  const playlistData = playlist.data
  const tracks = playlistData.tracks || []
  const coverImage = tracks[0]?.cover

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/playlists')}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Playlist Details</h1>
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-8">
          {/* Cover */}
          <div className="w-48 h-48 bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
            {coverImage ? (
              <img
                src={`https://${coverImage.replace('%%', '400x400')}`}
                alt={playlistData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-dark-400">♪</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-white mb-2">
              {playlistData.name}
            </h2>
            {playlistData.description && (
              <p className="text-dark-300 mb-4">
                {playlistData.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-dark-400">
              <span>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>
                {playlistData.is_public ? 'Public' : 'Private'}
              </span>
              <span>•</span>
              <span>
                Created {new Date(playlistData.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handlePlayAll}
                disabled={tracks.length === 0}
                className="btn btn-primary flex items-center space-x-2"
              >
                <FaPlay className="w-4 h-4" />
                <span>Play All</span>
              </button>

              {user && user.id === playlistData.user_id && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn btn-secondary text-red-400 hover:text-red-300 flex items-center space-x-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Tracks</h3>
            {tracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <FaPlay className="w-3 h-3" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-12">
              <FaPlus className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No tracks yet</h4>
              <p className="text-dark-400 mb-6">
                Add tracks to this playlist by searching for music and clicking the add button
              </p>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary"
              >
                Discover Music
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {tracks.map((track, index) => (
                <div key={`${track.id}-${index}`} className="relative">
                  <TrackCard
                    track={track}
                    showAddToPlaylist={false}
                  />
                  {user && user.id === playlistData.user_id && (
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from playlist"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistDetail