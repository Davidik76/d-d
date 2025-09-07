import React, { useState } from 'react'
import { playlistsAPI } from '../services/api'
import { FaTimes } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Playlist name is required')
      return
    }

    setLoading(true)
    try {
      await playlistsAPI.createPlaylist(
        formData.name.trim(),
        formData.description.trim() || null,
        formData.is_public
      )
      onSuccess()
    } catch (error) {
      console.error('Error creating playlist:', error)
      toast.error('Error creating playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
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
          <h2 className="text-xl font-semibold">Create New Playlist</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Playlist Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Enter playlist name"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input w-full h-20 resize-none"
              placeholder="Enter playlist description (optional)"
              maxLength={500}
            />
          </div>

          {/* Public/Private */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="is_public" className="text-sm text-dark-300">
              Make this playlist public
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Create Playlist'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlaylistModal