import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { musicAPI } from '../services/api'
import { usePlayer } from '../contexts/PlayerContext'
import TrackCard from '../components/TrackCard'
import AlbumCard from '../components/AlbumCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FaSearch, FaMusic, FaChartLine } from 'react-icons/fa'

const Home = () => {
  const { playTrack } = usePlayer()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch chart/popular tracks
  const { data: chartData, isLoading: chartLoading } = useQuery(
    'chart',
    () => musicAPI.getChart(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Fetch popular albums (using search with empty query to get popular content)
  const { data: popularData, isLoading: popularLoading } = useQuery(
    'popular',
    () => musicAPI.search('популярные', 'album', 0),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handlePlayAll = () => {
    if (chartData?.data?.tracks) {
      playTrack(chartData.data.tracks[0], chartData.data.tracks)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-900/20 to-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Your
              <span className="gradient-text block">Next Favorite Song</span>
            </h1>
            <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
              Stream millions of songs from Yandex Music. Create playlists, save favorites, and enjoy music like never before.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, artists, albums..."
                  className="w-full px-6 py-4 pl-14 text-lg bg-dark-800 border border-dark-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Tracks */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FaChartLine className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">Popular Tracks</h2>
            </div>
            {chartData?.data?.tracks && (
              <button
                onClick={handlePlayAll}
                className="btn btn-primary btn-sm"
              >
                Play All
              </button>
            )}
          </div>

          {chartLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-4">
              {chartData?.data?.tracks?.slice(0, 10).map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Albums */}
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <FaMusic className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
          </div>

          {popularLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularData?.data?.albums?.slice(0, 12).map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Why Choose Our Music Service?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMusic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Unlimited Music
              </h3>
              <p className="text-dark-300">
                Access millions of songs from Yandex Music's vast library
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Search
              </h3>
              <p className="text-dark-300">
                Find your favorite tracks, artists, and albums with powerful search
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Personalized Playlists
              </h3>
              <p className="text-dark-300">
                Create and manage your own playlists with favorites
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home