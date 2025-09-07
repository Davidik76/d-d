import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { userAPI, playlistsAPI, favoritesAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import EditProfileModal from '../components/EditProfileModal'
import { FaUser, FaEdit, FaSignOut, FaHeart, FaList, FaChartLine } from 'react-icons/fa'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery(
    'userStats',
    () => userAPI.getUserStats(),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const { data: playlists, isLoading: playlistsLoading } = useQuery(
    'userPlaylists',
    () => playlistsAPI.getPlaylists(),
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    'userFavorites',
    () => favoritesAPI.getFavorites(),
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  const handleSignOut = async () => {
    await signOut()
  }

  const handleProfileUpdate = async (updates) => {
    try {
      await updateProfile(updates)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Not Signed In</h2>
          <p className="text-dark-400 mb-6">
            Please sign in to view your profile
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
        {/* Profile Header */}
        <div className="bg-dark-800 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile?.display_name || user.email}
              </h1>
              <p className="text-dark-300 mb-4">{user.email}</p>
              <p className="text-sm text-dark-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FaEdit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary text-red-400 hover:text-red-300 flex items-center space-x-2"
              >
                <FaSignOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <FaHeart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.data?.favorites_count || 0}
                </p>
                <p className="text-sm text-dark-400">Favorite Tracks</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <FaList className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {playlistsLoading ? '...' : playlists?.data?.length || 0}
                </p>
                <p className="text-sm text-dark-400">Playlists</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.data?.total_tracks_in_playlists || 0}
                </p>
                <p className="text-sm text-dark-400">Tracks in Playlists</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Favorites */}
          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <FaHeart className="w-5 h-5 text-red-500" />
                <span>Recent Favorites</span>
              </h3>
              <button
                onClick={() => window.location.href = '/favorites'}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                View All
              </button>
            </div>

            {favoritesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : !favorites?.data || favorites.data.length === 0 ? (
              <div className="text-center py-8">
                <FaHeart className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No favorites yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.data.slice(0, 5).map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-dark-700 rounded flex-shrink-0 overflow-hidden">
                      {favorite.track_data?.cover ? (
                        <img
                          src={`https://${favorite.track_data.cover.replace('%%', '100x100')}`}
                          alt={favorite.track_data.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">♪</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {favorite.track_data?.title}
                      </p>
                      <p className="text-xs text-dark-400 truncate">
                        {favorite.track_data?.artists?.map(artist => artist.name).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Playlists */}
          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <FaList className="w-5 h-5 text-primary-400" />
                <span>Recent Playlists</span>
              </h3>
              <button
                onClick={() => window.location.href = '/playlists'}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                View All
              </button>
            </div>

            {playlistsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : !playlists?.data || playlists.data.length === 0 ? (
              <div className="text-center py-8">
                <FaList className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No playlists yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.data.slice(0, 5).map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-dark-700 p-2 rounded-lg transition-colors"
                    onClick={() => window.location.href = `/playlists/${playlist.id}`}
                  >
                    <div className="w-10 h-10 bg-dark-700 rounded flex-shrink-0 flex items-center justify-center">
                      <FaList className="w-5 h-5 text-dark-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-dark-400">
                        {playlist.tracks?.length || 0} tracks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default Profile