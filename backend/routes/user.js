const express = require('express');
const supabase = require('../services/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get user statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    // Get favorites count
    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);
    
    // Get playlists count
    const { count: playlistsCount } = await supabase
      .from('playlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);
    
    // Get total tracks in playlists
    const { data: playlists } = await supabase
      .from('playlists')
      .select('tracks')
      .eq('user_id', req.user.id);
    
    const totalTracksInPlaylists = playlists?.reduce((total, playlist) => {
      return total + (playlist.tracks?.length || 0);
    }, 0) || 0;
    
    res.json({
      favorites_count: favoritesCount || 0,
      playlists_count: playlistsCount || 0,
      total_tracks_in_playlists: totalTracksInPlaylists
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// Get user's recent activity
router.get('/activity', authenticateUser, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent favorites
    const { data: recentFavorites } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    // Get recent playlists
    const { data: recentPlaylists } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit));
    
    res.json({
      recent_favorites: recentFavorites || [],
      recent_playlists: recentPlaylists || []
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

module.exports = router;