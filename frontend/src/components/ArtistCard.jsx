import React from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { FaPlay, FaPause } from 'react-icons/fa'

const ArtistCard = ({ artist, className = '' }) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer()

  const handlePlay = () => {
    if (artist.tracks && artist.tracks.length > 0) {
      // Play the first track of the artist
      playTrack(artist.tracks[0], artist.tracks)
    }
  }

  const isPlayingArtist = artist.tracks?.some(track => 
    currentTrack?.id === track.id && isPlaying
  )

  return (
    <div className={`group bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors cursor-pointer ${className}`}>
      <div className="space-y-3">
        {/* Artist Cover */}
        <div className="relative w-full aspect-square bg-dark-700 rounded-full overflow-hidden">
          {artist.cover ? (
            <img
              src={`https://${artist.cover.replace('%%', '300x300')}`}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-dark-400">♪</span>
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <button
              onClick={handlePlay}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isPlayingArtist ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Artist Info */}
        <div className="space-y-1 text-center">
          <h4 className="text-sm font-medium text-white truncate">
            {artist.name}
          </h4>
          {artist.genres && artist.genres.length > 0 && (
            <p className="text-xs text-dark-400 truncate">
              {artist.genres.slice(0, 2).join(', ')}
            </p>
          )}
          {artist.tracks && (
            <p className="text-xs text-dark-500">
              {artist.tracks.length} tracks
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArtistCard