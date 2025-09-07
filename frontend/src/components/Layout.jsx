import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePlayer } from '../contexts/PlayerContext'
import { FaHome, FaSearch, FaHeart, FaList, FaUser, FaBars, FaTimes } from 'react-icons/fa'
import MusicPlayer from './MusicPlayer'
import AuthModal from './AuthModal'

const Layout = ({ children }) => {
  const { user, signOut } = useAuth()
  const { currentTrack } = usePlayer()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Search', href: '/search', icon: FaSearch },
    { name: 'Favorites', href: '/favorites', icon: FaHeart, requiresAuth: true },
    { name: 'Playlists', href: '/playlists', icon: FaList, requiresAuth: true },
    { name: 'Profile', href: '/profile', icon: FaUser, requiresAuth: true },
  ]

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  const handleAuthClick = () => {
    setShowAuthModal(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">♪</span>
              </div>
              <span className="text-xl font-bold gradient-text">Music Service</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                if (item.requiresAuth && !user) {
                  return (
                    <button
                      key={item.name}
                      onClick={handleAuthClick}
                      className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'text-primary-400'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu / Auth Button */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-dark-300">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="btn btn-primary btn-sm"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-dark-700 bg-dark-800">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                if (item.requiresAuth && !user) {
                  return (
                    <button
                      key={item.name}
                      onClick={handleAuthClick}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'text-primary-400 bg-dark-700'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {user ? (
                <div className="border-t border-dark-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-dark-300">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-dark-700 pt-2 mt-2">
                  <button
                    onClick={handleAuthClick}
                    className="flex items-center justify-center w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`${currentTrack ? 'pb-32' : 'pb-8'}`}>
        {children}
      </main>

      {/* Music Player */}
      {currentTrack && <MusicPlayer />}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}

export default Layout