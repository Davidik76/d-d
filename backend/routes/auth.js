const express = require('express');
const supabase = require('../services/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create or update user profile
router.post('/profile', authenticateUser, async (req, res) => {
  try {
    const { display_name, avatar_url } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        display_name: display_name || req.user.email,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to update profile' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;