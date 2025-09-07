#!/usr/bin/env python3
"""
Yandex Music API wrapper for Node.js backend
"""

import sys
import json
import os
from yandex_music import Client
from yandex_music.exceptions import YandexMusicError

def init_client():
    """Initialize Yandex Music client"""
    token = os.getenv('YANDEX_MUSIC_TOKEN')
    if not token:
        raise Exception('YANDEX_MUSIC_TOKEN not found in environment variables')
    
    try:
        client = Client(token)
        return client
    except YandexMusicError as e:
        raise Exception(f'Failed to initialize Yandex Music client: {str(e)}')

def search_music(query, search_type='all', page=0):
    """Search for music"""
    try:
        client = init_client()
        
        # Map search types
        type_map = {
            'all': 'all',
            'track': 'track',
            'album': 'album',
            'artist': 'artist',
            'playlist': 'playlist'
        }
        
        search_type = type_map.get(search_type, 'all')
        
        # Perform search
        search_result = client.search(query, type_=search_type, page=page)
        
        # Format results
        results = {
            'query': query,
            'type': search_type,
            'page': page,
            'tracks': [],
            'albums': [],
            'artists': [],
            'playlists': []
        }
        
        if search_result.tracks:
            for track in search_result.tracks.results:
                track_data = {
                    'id': track.id,
                    'title': track.title,
                    'artists': [{'id': artist.id, 'name': artist.name} for artist in track.artists],
                    'album': {
                        'id': track.albums[0].id if track.albums else None,
                        'title': track.albums[0].title if track.albums else None,
                        'cover': track.albums[0].cover_uri if track.albums else None
                    },
                    'duration': track.duration_ms,
                    'available': track.available,
                    'cover': track.cover_uri
                }
                results['tracks'].append(track_data)
        
        if search_result.albums:
            for album in search_result.albums.results:
                album_data = {
                    'id': album.id,
                    'title': album.title,
                    'artists': [{'id': artist.id, 'name': artist.name} for artist in album.artists],
                    'year': album.year,
                    'track_count': album.track_count,
                    'cover': album.cover_uri
                }
                results['albums'].append(album_data)
        
        if search_result.artists:
            for artist in search_result.artists.results:
                artist_data = {
                    'id': artist.id,
                    'name': artist.name,
                    'cover': artist.cover.uri if artist.cover else None,
                    'genres': artist.genres
                }
                results['artists'].append(artist_data)
        
        if search_result.playlists:
            for playlist in search_result.playlists.results:
                playlist_data = {
                    'id': playlist.playlist_id,
                    'title': playlist.title,
                    'description': playlist.description,
                    'track_count': playlist.track_count,
                    'cover': playlist.cover.uri if playlist.cover else None,
                    'owner': {
                        'id': playlist.owner.uid if playlist.owner else None,
                        'name': playlist.owner.name if playlist.owner else None
                    }
                }
                results['playlists'].append(playlist_data)
        
        return results
        
    except Exception as e:
        return {'error': str(e)}

def get_track(track_id):
    """Get track information"""
    try:
        client = init_client()
        track = client.tracks(track_id)[0]
        
        track_data = {
            'id': track.id,
            'title': track.title,
            'artists': [{'id': artist.id, 'name': artist.name} for artist in track.artists],
            'album': {
                'id': track.albums[0].id if track.albums else None,
                'title': track.albums[0].title if track.albums else None,
                'cover': track.albums[0].cover_uri if track.albums else None
            },
            'duration': track.duration_ms,
            'available': track.available,
            'cover': track.cover_uri,
            'lyrics': track.lyrics if hasattr(track, 'lyrics') else None
        }
        
        return track_data
        
    except Exception as e:
        return {'error': str(e)}

def get_download_info(track_id):
    """Get track download information"""
    try:
        client = init_client()
        track = client.tracks(track_id)[0]
        
        # Get download info
        download_info = track.get_download_info()
        
        # Find best quality
        best_quality = None
        for info in download_info:
            if info.codec == 'mp3' and info.bitrate_in_kbps >= 320:
                best_quality = info
                break
            elif not best_quality or info.bitrate_in_kbps > best_quality.bitrate_in_kbps:
                best_quality = info
        
        if not best_quality:
            return {'error': 'No download info available'}
        
        # Get direct link
        direct_link = best_quality.get_direct_link()
        
        return {
            'track_id': track_id,
            'codec': best_quality.codec,
            'bitrate': best_quality.bitrate_in_kbps,
            'direct_link': direct_link,
            'size': best_quality.file_size
        }
        
    except Exception as e:
        return {'error': str(e)}

def get_playlist(playlist_id):
    """Get playlist information"""
    try:
        client = init_client()
        playlist = client.playlists(playlist_id)
        
        playlist_data = {
            'id': playlist.playlist_id,
            'title': playlist.title,
            'description': playlist.description,
            'track_count': playlist.track_count,
            'cover': playlist.cover.uri if playlist.cover else None,
            'owner': {
                'id': playlist.owner.uid if playlist.owner else None,
                'name': playlist.owner.name if playlist.owner else None
            },
            'tracks': []
        }
        
        if playlist.tracks:
            for track in playlist.tracks:
                track_data = {
                    'id': track.id,
                    'title': track.title,
                    'artists': [{'id': artist.id, 'name': artist.name} for artist in track.artists],
                    'album': {
                        'id': track.albums[0].id if track.albums else None,
                        'title': track.albums[0].title if track.albums else None,
                        'cover': track.albums[0].cover_uri if track.albums else None
                    },
                    'duration': track.duration_ms,
                    'available': track.available,
                    'cover': track.cover_uri
                }
                playlist_data['tracks'].append(track_data)
        
        return playlist_data
        
    except Exception as e:
        return {'error': str(e)}

def get_album(album_id):
    """Get album information"""
    try:
        client = init_client()
        album = client.albums(album_id)
        
        album_data = {
            'id': album.id,
            'title': album.title,
            'artists': [{'id': artist.id, 'name': artist.name} for artist in album.artists],
            'year': album.year,
            'track_count': album.track_count,
            'cover': album.cover_uri,
            'tracks': []
        }
        
        if album.tracks:
            for track in album.tracks:
                track_data = {
                    'id': track.id,
                    'title': track.title,
                    'artists': [{'id': artist.id, 'name': artist.name} for artist in track.artists],
                    'duration': track.duration_ms,
                    'available': track.available,
                    'cover': track.cover_uri
                }
                album_data['tracks'].append(track_data)
        
        return album_data
        
    except Exception as e:
        return {'error': str(e)}

def get_artist(artist_id):
    """Get artist information"""
    try:
        client = init_client()
        artist = client.artists(artist_id)
        
        artist_data = {
            'id': artist.id,
            'name': artist.name,
            'cover': artist.cover.uri if artist.cover else None,
            'genres': artist.genres,
            'albums': [],
            'tracks': []
        }
        
        # Get artist albums
        if hasattr(artist, 'albums') and artist.albums:
            for album in artist.albums:
                album_data = {
                    'id': album.id,
                    'title': album.title,
                    'year': album.year,
                    'cover': album.cover_uri
                }
                artist_data['albums'].append(album_data)
        
        # Get popular tracks
        if hasattr(artist, 'tracks') and artist.tracks:
            for track in artist.tracks:
                track_data = {
                    'id': track.id,
                    'title': track.title,
                    'duration': track.duration_ms,
                    'available': track.available,
                    'cover': track.cover_uri
                }
                artist_data['tracks'].append(track_data)
        
        return artist_data
        
    except Exception as e:
        return {'error': str(e)}

def get_chart():
    """Get chart/popular tracks"""
    try:
        client = init_client()
        
        # Get chart tracks
        chart = client.chart()
        
        chart_data = {
            'tracks': []
        }
        
        if chart.tracks:
            for track in chart.tracks:
                track_data = {
                    'id': track.id,
                    'title': track.title,
                    'artists': [{'id': artist.id, 'name': artist.name} for artist in track.artists],
                    'album': {
                        'id': track.albums[0].id if track.albums else None,
                        'title': track.albums[0].title if track.albums else None,
                        'cover': track.albums[0].cover_uri if track.albums else None
                    },
                    'duration': track.duration_ms,
                    'available': track.available,
                    'cover': track.cover_uri
                }
                chart_data['tracks'].append(track_data)
        
        return chart_data
        
    except Exception as e:
        return {'error': str(e)}

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == 'search':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Search query required'}))
                sys.exit(1)
            
            query = sys.argv[2]
            search_type = sys.argv[3] if len(sys.argv) > 3 else 'all'
            page = int(sys.argv[4]) if len(sys.argv) > 4 else 0
            
            result = search_music(query, search_type, page)
            print(json.dumps(result))
            
        elif command == 'track':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Track ID required'}))
                sys.exit(1)
            
            track_id = sys.argv[2]
            result = get_track(track_id)
            print(json.dumps(result))
            
        elif command == 'download_info':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Track ID required'}))
                sys.exit(1)
            
            track_id = sys.argv[2]
            result = get_download_info(track_id)
            print(json.dumps(result))
            
        elif command == 'playlist':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Playlist ID required'}))
                sys.exit(1)
            
            playlist_id = sys.argv[2]
            result = get_playlist(playlist_id)
            print(json.dumps(result))
            
        elif command == 'album':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Album ID required'}))
                sys.exit(1)
            
            album_id = sys.argv[2]
            result = get_album(album_id)
            print(json.dumps(result))
            
        elif command == 'artist':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'Artist ID required'}))
                sys.exit(1)
            
            artist_id = sys.argv[2]
            result = get_artist(artist_id)
            print(json.dumps(result))
            
        elif command == 'chart':
            result = get_chart()
            print(json.dumps(result))
            
        else:
            print(json.dumps({'error': f'Unknown command: {command}'}))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()