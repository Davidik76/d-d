import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { playlistsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import CreatePlaylistModal from '../components/CreatePlaylistModal'
import { FaPlus, FaList, FaSignInAlt, FaPlay } from 'react-icons/fa'
import toast from 'react-hot-toast'

const Playlists = () => {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: playlists, isLoading, error, refetch } = useQuery(
    'playlists',
    () => playlistsAPI.getPlaylists(),
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const handleCreatePlaylist = () => {
    setShowCreateModal(true)
  }

  const handlePlaylistCreated = () => {
    setShowCreateModal(false)
    refetch()
    toast.success('Playlist created successfully!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <FaSignInAlt className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-dark-400 mb-6">
            Please sign in to view and create playlists
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
            <FaList className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-white">Playlists</h1>
          </div>
          
          <button
            onClick={handleCreatePlaylist}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Error loading playlists: {error.message}</p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : !playlists?.data || playlists.data.length === 0 ? (
          <div className="text-center py-12">
            <FaList className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-dark-400 mb-6">
              Create your first playlist to organize your favorite tracks
            </p>
            <button
              onClick={handleCreatePlaylist}
              className="btn btn-primary"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.data.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <CreatePlaylistModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handlePlaylistCreated}
          />
        )}
      </div>
    </div>
  )
}

const PlaylistCard = ({ playlist }) => {
  const { playTrack } = usePlayer()
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePlay = () => {
    const tracks = playlist.tracks || []
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return
    }

    setIsDeleting(true)
    try {
      await playlistsAPI.deletePlaylist(playlist.id)
      toast.success('Playlist deleted successfully')
      window.location.reload() // Refresh to update the list
    } catch (error) {
      console.error('Error deleting playlist:', error)
      toast.error('Error deleting playlist')
    } finally {
      setIsDeleting(false)
    }
  }

  const trackCount = playlist.tracks?.length || 0
  const coverImage = playlist.tracks?.[0]?.cover

  return (
    <div className="group bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors">
      <div className="space-y-3">
        {/* Playlist Cover */}
        <div className="relative w-full aspect-square bg-dark-700 rounded-lg overflow-hidden">
          {coverImage ? (
            <img
              src={`https://${coverImage.replace('%%', '300x300')}`}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaList className="w-12 h-12 text-dark-400" />
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePlay}
              disabled={trackCount === 0}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlay className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-white truncate">
            {playlist.name}
          </h4>
          <p className="text-xs text-dark-400">
            {trackCount} track{trackCount !== 1 ? 's' : ''}
          </p>
          {playlist.description && (
            <p className="text-xs text-dark-500 truncate">
              {playlist.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.location.href = `/playlists/${playlist.id}`}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            View Details
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Playlists