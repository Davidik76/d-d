const express = require('express');
const yandexMusic = require('../services/yandexMusic');
const { cacheMiddleware } = require('../middleware/cache');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search music
router.get('/search', optionalAuth, cacheMiddleware(300), async (req, res) => {
  try {
    const { q, type = 'all', page = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await yandexMusic.search(q, type, parseInt(page));
    
    if (results.error) {
      return res.status(400).json({ error: results.error });
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get track details
router.get('/track/:id', optionalAuth, cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const track = await yandexMusic.getTrack(id);
    
    if (track.error) {
      return res.status(404).json({ error: track.error });
    }
    
    res.json(track);
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: 'Failed to get track' });
  }
});

// Get track download info (for streaming)
router.get('/track/:id/play', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const downloadInfo = await yandexMusic.getTrackDownloadInfo(id);
    
    if (downloadInfo.error) {
      return res.status(404).json({ error: downloadInfo.error });
    }
    
    res.json(downloadInfo);
  } catch (error) {
    console.error('Get download info error:', error);
    res.status(500).json({ error: 'Failed to get track download info' });
  }
});

// Get playlist
router.get('/playlist/:id', optionalAuth, cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await yandexMusic.getPlaylist(id);
    
    if (playlist.error) {
      return res.status(404).json({ error: playlist.error });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Get album
router.get('/album/:id', optionalAuth, cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await yandexMusic.getAlbum(id);
    
    if (album.error) {
      return res.status(404).json({ error: album.error });
    }
    
    res.json(album);
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Failed to get album' });
  }
});

// Get artist
router.get('/artist/:id', optionalAuth, cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const artist = await yandexMusic.getArtist(id);
    
    if (artist.error) {
      return res.status(404).json({ error: artist.error });
    }
    
    res.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ error: 'Failed to get artist' });
  }
});

// Get chart/popular tracks
router.get('/chart', optionalAuth, cacheMiddleware(1800), async (req, res) => {
  try {
    const chart = await yandexMusic.getChart();
    
    if (chart.error) {
      return res.status(400).json({ error: chart.error });
    }
    
    res.json(chart);
  } catch (error) {
    console.error('Get chart error:', error);
    res.status(500).json({ error: 'Failed to get chart' });
  }
});

module.exports = router;