/* eslint-disable no-underscore-dangle */
import {
  Album,
  Artist,
  Genre,
  Playlist,
  PlaylistItem,
  PlayQueueItem,
  Track,
} from 'api/index';

export const isAlbum = (x: any): x is Album => x._type === 'album';
export const isArtist = (x: any): x is Artist => x._type === 'artist';
export const isGenre = (x: any): x is Genre => x._type === 'genre';
export const isPlaylist = (x: any): x is Playlist => x._type === 'playlist';
export const isPlaylistItem = (x: any)
  : x is PlaylistItem => (x._type === 'playlistItem' && !x.smart);
export const isPlayQueueItem = (x: any): x is PlayQueueItem => x._type === 'playQueueItem';
export const isSmartPlaylistItem = (x: any)
: x is PlaylistItem => (x._type === 'playlistItem' && x.smart);
export const isTrack = (x: any): x is Track => x._type === 'track';
