import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

const PlayerContext = createContext({})

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

const initialState = {
  currentTrack: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isPaused: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  repeat: 'none', // 'none', 'one', 'all'
  shuffle: false,
  isLoading: false,
}

const playerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        currentTime: 0,
        duration: action.payload?.duration || 0,
      }
    
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload,
        currentIndex: 0,
      }
    
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, ...action.payload],
      }
    
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload,
        currentTrack: state.queue[action.payload] || null,
        currentTime: 0,
      }
    
    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
      }
    
    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
        isPaused: true,
      }
    
    case 'STOP':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      }
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
      }
    
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      }
    
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      }
    
    case 'SET_REPEAT':
      return {
        ...state,
        repeat: action.payload,
      }
    
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        shuffle: !state.shuffle,
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    
    case 'NEXT_TRACK':
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.queue.length)
        : (state.currentIndex + 1) % state.queue.length
      
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex] || null,
        currentTime: 0,
      }
    
    case 'PREVIOUS_TRACK':
      const prevIndex = state.currentIndex === 0 
        ? state.queue.length - 1 
        : state.currentIndex - 1
      
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: state.queue[prevIndex] || null,
        currentTime: 0,
      }
    
    default:
      return state
  }
}

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  const audioRef = useRef(null)

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
    }

    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration })
    }

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime })
    }

    const handleEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0
        audio.play()
      } else if (state.repeat === 'all' || state.currentIndex < state.queue.length - 1) {
        dispatch({ type: 'NEXT_TRACK' })
      } else {
        dispatch({ type: 'STOP' })
      }
    }

    const handleError = (e) => {
      console.error('Audio error:', e)
      toast.error('Error playing track')
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true })
    }

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [state.repeat, state.currentIndex, state.queue.length])

  // Update audio source when current track changes
  useEffect(() => {
    if (state.currentTrack && audioRef.current) {
      const audio = audioRef.current
      
      // Get track download info and set source
      if (state.currentTrack.direct_link) {
        audio.src = state.currentTrack.direct_link
      } else {
        // Fallback to preview or show error
        toast.error('Track not available for streaming')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [state.currentTrack])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current
    audio.volume = state.volume

    if (state.isPlaying) {
      audio.play().catch(error => {
        console.error('Play error:', error)
        toast.error('Error playing track')
        dispatch({ type: 'PAUSE' })
      })
    } else {
      audio.pause()
    }
  }, [state.isPlaying, state.volume])

  const playTrack = (track, queue = null) => {
    if (queue) {
      dispatch({ type: 'SET_QUEUE', payload: queue })
      const index = queue.findIndex(t => t.id === track.id)
      dispatch({ type: 'SET_CURRENT_INDEX', payload: index >= 0 ? index : 0 })
    } else {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: track })
    }
    dispatch({ type: 'PLAY' })
  }

  const playPause = () => {
    if (state.isPlaying) {
      dispatch({ type: 'PAUSE' })
    } else {
      dispatch({ type: 'PLAY' })
    }
  }

  const nextTrack = () => {
    if (state.queue.length > 0) {
      dispatch({ type: 'NEXT_TRACK' })
    }
  }

  const previousTrack = () => {
    if (state.queue.length > 0) {
      dispatch({ type: 'PREVIOUS_TRACK' })
    }
  }

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      dispatch({ type: 'SET_CURRENT_TIME', payload: time })
    }
  }

  const setVolume = (volume) => {
    dispatch({ type: 'SET_VOLUME', payload: volume })
  }

  const toggleRepeat = () => {
    const repeatModes = ['none', 'all', 'one']
    const currentIndex = repeatModes.indexOf(state.repeat)
    const nextIndex = (currentIndex + 1) % repeatModes.length
    dispatch({ type: 'SET_REPEAT', payload: repeatModes[nextIndex] })
  }

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' })
  }

  const addToQueue = (tracks) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: tracks })
  }

  const clearQueue = () => {
    dispatch({ type: 'SET_QUEUE', payload: [] })
    dispatch({ type: 'STOP' })
  }

  const value = {
    ...state,
    playTrack,
    playPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    clearQueue,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}