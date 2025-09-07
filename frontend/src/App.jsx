import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Playlists = lazy(() => import('./pages/Playlists'))
const Profile = lazy(() => import('./pages/Profile'))
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App