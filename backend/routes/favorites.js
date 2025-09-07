const express = require('express');
const supabase = require('../services/supabase');
const { authenticateUser } = require('../middleware/auth');
const { invalidateCache } = require('../middleware/cache');

const router = express.Router();

// Get user's favorites
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to get favorites' });
    }
    
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add track to favorites
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { track_id, track_data } = req.body;
    
    if (!track_id) {
      return res.status(400).json({ error: 'Track ID is required' });
    }
    
    // Check if already in favorites
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('track_id', track_id)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Track already in favorites' });
    }
    
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: req.user.id,
        track_id,
        track_data: track_data || null
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Failed to add to favorites' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/favorites`);
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove track from favorites
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to remove from favorites' });
    }
    
    // Invalidate cache
    invalidateCache(`/api/favorites`);
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if track is in favorites
router.get('/check/:track_id', authenticateUser, async (req, res) => {
  try {
    const { track_id } = req.params;
    
    const { data: favorite, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('track_id', track_id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check favorites' });
    }
    
    res.json({ is_favorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorites' });
  }
});

module.exports = router;