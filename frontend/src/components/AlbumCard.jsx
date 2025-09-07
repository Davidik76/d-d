import React from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { FaPlay, FaPause } from 'react-icons/fa'

const AlbumCard = ({ album, className = '' }) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer()

  const handlePlay = () => {
    if (album.tracks && album.tracks.length > 0) {
      // Play the first track of the album
      playTrack(album.tracks[0], album.tracks)
    }
  }

  const isPlayingAlbum = album.tracks?.some(track => 
    currentTrack?.id === track.id && isPlaying
  )

  return (
    <div className={`group bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors cursor-pointer ${className}`}>
      <div className="space-y-3">
        {/* Album Cover */}
        <div className="relative w-full aspect-square bg-dark-700 rounded-lg overflow-hidden">
          {album.cover ? (
            <img
              src={`https://${album.cover.replace('%%', '300x300')}`}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-dark-400">♪</span>
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePlay}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPlayingAlbum ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Album Info */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-white truncate">
            {album.title}
          </h4>
          <p className="text-xs text-dark-400 truncate">
            {album.artists?.map(artist => artist.name).join(', ')}
          </p>
          {album.year && (
            <p className="text-xs text-dark-500">
              {album.year}
            </p>
          )}
          {album.track_count && (
            <p className="text-xs text-dark-500">
              {album.track_count} tracks
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlbumCard