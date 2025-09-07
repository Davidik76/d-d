import React, { useState } from 'react'
import { FaTimes, FaUser } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.display_name.trim()) {
      toast.error('Display name is required')
      return
    }

    setLoading(true)
    try {
      await onSave({
        display_name: formData.display_name.trim(),
        avatar_url: formData.avatar_url.trim() || null,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-dark-300 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Enter your display name"
              required
              maxLength={50}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-dark-300 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleInputChange}
              className="input w-full"
              placeholder="Enter avatar image URL (optional)"
            />
            <p className="text-xs text-dark-500 mt-1">
              Enter a URL to an image for your avatar
            </p>
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal