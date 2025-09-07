import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { musicAPI } from '../services/api'
import { usePlayer } from '../contexts/PlayerContext'
import TrackCard from '../components/TrackCard'
import AlbumCard from '../components/AlbumCard'
import ArtistCard from '../components/ArtistCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { FaSearch, FaMusic, FaUser, FaList, FaPlay } from 'react-icons/fa'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { playTrack } = usePlayer()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(0)

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery })
    }
  }, [debouncedQuery, setSearchParams])

  // Search query
  const { data: searchData, isLoading, error } = useQuery(
    ['search', debouncedQuery, activeTab, page],
    () => musicAPI.search(debouncedQuery, activeTab, page),
    {
      enabled: !!debouncedQuery,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setPage(0)
      setDebouncedQuery(query.trim())
    }
  }

  const handlePlayAll = () => {
    const tracks = searchData?.data?.tracks || []
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }

  const tabs = [
    { id: 'all', label: 'All', icon: FaSearch },
    { id: 'track', label: 'Tracks', icon: FaMusic },
    { id: 'album', label: 'Albums', icon: FaList },
    { id: 'artist', label: 'Artists', icon: FaUser },
  ]

  const hasResults = searchData?.data && (
    (searchData.data.tracks && searchData.data.tracks.length > 0) ||
    (searchData.data.albums && searchData.data.albums.length > 0) ||
    (searchData.data.artists && searchData.data.artists.length > 0)
  )

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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

        {/* Search Results */}
        {debouncedQuery && (
          <>
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-dark-800 p-1 rounded-lg w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">Error searching: {error.message}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : !hasResults ? (
              <div className="text-center py-12">
                <FaSearch className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-dark-400">
                  Try searching for something else or check your spelling
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Tracks */}
                {((activeTab === 'all' || activeTab === 'track') && searchData?.data?.tracks?.length > 0) && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <FaMusic className="w-5 h-5" />
                        <span>Tracks ({searchData.data.tracks.length})</span>
                      </h2>
                      {searchData.data.tracks.length > 0 && (
                        <button
                          onClick={handlePlayAll}
                          className="btn btn-primary btn-sm flex items-center space-x-2"
                        >
                          <FaPlay className="w-3 h-3" />
                          <span>Play All</span>
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      {searchData.data.tracks.map((track) => (
                        <TrackCard key={track.id} track={track} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {((activeTab === 'all' || activeTab === 'album') && searchData?.data?.albums?.length > 0) && (
                  <section>
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2 mb-4">
                      <FaList className="w-5 h-5" />
                      <span>Albums ({searchData.data.albums.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {searchData.data.albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Artists */}
                {((activeTab === 'all' || activeTab === 'artist') && searchData?.data?.artists?.length > 0) && (
                  <section>
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2 mb-4">
                      <FaUser className="w-5 h-5" />
                      <span>Artists ({searchData.data.artists.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {searchData.data.artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}

        {/* No Search Query */}
        {!debouncedQuery && (
          <div className="text-center py-12">
            <FaSearch className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Start Searching</h3>
            <p className="text-dark-400">
              Enter a search term above to find your favorite music
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search