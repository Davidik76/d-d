const express = require('express');
const supabase = require('../services/supabase');
const { authenticateUser } = require('../middleware/auth');
const { invalidateCache } = require('../middleware/cache');

const router = express.Router();

// Get user's playlists
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to get playlists' });
    }
    
    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Get specific playlist
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: playlist, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Create new playlist
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { name, description, is_public = false } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    
    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        user_id: req.user.id,
        name,
        description: description || null,
        is_public,
        tracks: []
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to create playlist' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/playlists`);
    
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Update playlist
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_public, tracks } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (tracks !== undefined) updateData.tracks = tracks;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: playlist, error } = await supabase
      .from('playlists')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to update playlist' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/playlists`);
    
    res.json(playlist);
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Add track to playlist
router.post('/:id/tracks', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { track } = req.body;
    
    if (!track) {
      return res.status(400).json({ error: 'Track data is required' });
    }
    
    // Get current playlist
    const { data: playlist, error: getError } = await supabase
      .from('playlists')
      .select('tracks')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (getError) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Check if track already exists
    const existingTracks = playlist.tracks || [];
    const trackExists = existingTracks.some(t => t.id === track.id);
    
    if (trackExists) {
      return res.status(400).json({ error: 'Track already in playlist' });
    }
    
    // Add track
    const updatedTracks = [...existingTracks, track];
    
    const { data: updatedPlaylist, error: updateError } = await supabase
      .from('playlists')
      .update({ 
        tracks: updatedTracks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to add track to playlist' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/playlists`);
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Add track to playlist error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:track_id', authenticateUser, async (req, res) => {
  try {
    const { id, track_id } = req.params;
    
    // Get current playlist
    const { data: playlist, error: getError } = await supabase
      .from('playlists')
      .select('tracks')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (getError) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Remove track
    const existingTracks = playlist.tracks || [];
    const updatedTracks = existingTracks.filter(t => t.id !== track_id);
    
    const { data: updatedPlaylist, error: updateError } = await supabase
      .from('playlists')
      .update({ 
        tracks: updatedTracks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to remove track from playlist' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/playlists`);
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Remove track from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
});

// Delete playlist
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to delete playlist' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/playlists`);
    
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

module.exports = router;