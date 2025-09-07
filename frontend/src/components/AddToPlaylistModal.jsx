import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { playlistsAPI } from '../services/api'
import { FaTimes, FaPlus } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const AddToPlaylistModal = ({ track, onClose }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const { data: playlists, isLoading } = useQuery(
    'playlists',
    () => playlistsAPI.getPlaylists(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPlaylist) {
      toast.error('Please select a playlist')
      return
    }

    setIsAdding(true)
    try {
      await playlistsAPI.addTrackToPlaylist(selectedPlaylist, track)
      toast.success('Track added to playlist')
      onClose()
    } catch (error) {
      console.error('Error adding track to playlist:', error)
      toast.error('Error adding track to playlist')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-800 rounded-lg shadow-xl border border-dark-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-semibold">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Track Info */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-dark-700 rounded-lg">
            <div className="w-12 h-12 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
              {track.cover ? (
                <img
                  src={`https://${track.cover.replace('%%', '200x200')}`}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-lg">♪</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-white truncate">
                {track.title}
              </h4>
              <p className="text-xs text-dark-400 truncate">
                {track.artists?.map(artist => artist.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playlist" className="block text-sm font-medium text-dark-300 mb-2">
                Select Playlist
              </label>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : !playlists?.data || playlists.data.length === 0 ? (
                <div className="text-center py-8">
                  <FaPlus className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 mb-4">No playlists found</p>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/playlists'}
                    className="btn btn-primary btn-sm"
                  >
                    Create Playlist
                  </button>
                </div>
              ) : (
                <select
                  id="playlist"
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">Choose a playlist...</option>
                  {playlists.data.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name} ({playlist.tracks?.length || 0} tracks)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding || !selectedPlaylist}
                className="btn btn-primary"
              >
                {isAdding ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Add to Playlist'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddToPlaylistModal