const { spawn } = require('child_process');
const path = require('path');

class YandexMusicService {
  constructor() {
    this.token = process.env.YANDEX_MUSIC_TOKEN;
    this.pythonScript = path.join(__dirname, '../python/yandex_music_api.py');
  }

  async executePythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [scriptPath, ...args]);
      
      let data = '';
      let error = '';

      python.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      python.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${error}`));
        } else {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError.message}`));
          }
        }
      });
    });
  }

  async search(query, type = 'all', page = 0) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'search',
        query,
        type,
        page.toString()
      ]);
      return result;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search music');
    }
  }

  async getTrack(trackId) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'track',
        trackId
      ]);
      return result;
    } catch (error) {
      console.error('Get track error:', error);
      throw new Error('Failed to get track');
    }
  }

  async getTrackDownloadInfo(trackId) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'download_info',
        trackId
      ]);
      return result;
    } catch (error) {
      console.error('Get download info error:', error);
      throw new Error('Failed to get track download info');
    }
  }

  async getPlaylist(playlistId) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'playlist',
        playlistId
      ]);
      return result;
    } catch (error) {
      console.error('Get playlist error:', error);
      throw new Error('Failed to get playlist');
    }
  }

  async getAlbum(albumId) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'album',
        albumId
      ]);
      return result;
    } catch (error) {
      console.error('Get album error:', error);
      throw new Error('Failed to get album');
    }
  }

  async getArtist(artistId) {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'artist',
        artistId
      ]);
      return result;
    } catch (error) {
      console.error('Get artist error:', error);
      throw new Error('Failed to get artist');
    }
  }

  async getChart() {
    try {
      const result = await this.executePythonScript(this.pythonScript, [
        'chart'
      ]);
      return result;
    } catch (error) {
      console.error('Get chart error:', error);
      throw new Error('Failed to get chart');
    }
  }
}

module.exports = new YandexMusicService();