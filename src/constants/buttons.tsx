import { SvgIcon } from '@mui/material';
import React from 'react';
import { BsPlayFill } from 'react-icons/bs';
import { FiRadio } from 'react-icons/fi';
import { RiShuffleFill } from 'react-icons/ri';
import { TiArrowForward } from 'react-icons/ti';
import { PlayActions } from 'types/enums';

export interface ButtonSpecs {
  type: 'artist' | 'album' | 'track' | 'tracks' | 'playlist' | 'genre';
  icon: React.ReactNode;
  name: string;
  action: PlayActions;
  shuffle: boolean;
}

export const allButtons: ButtonSpecs[] = [
  {
    type: 'track',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_TRACK,
    shuffle: false,
  },
  {
    type: 'track',
    icon: <SvgIcon sx={{ mr: '8px' }}><FiRadio /></SvgIcon>,
    name: 'Play track radio',
    action: PlayActions.PLAY_TRACK_RADIO,
    shuffle: false,
  },
  {
    type: 'track',
    icon: <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACK,
    shuffle: false,
  },
  {
    type: 'track',
    icon: <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>,
    name: 'Play last',
    action: PlayActions.ADD_TRACK_LAST,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_ALBUM,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ mr: '8px', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_ALBUM,
    shuffle: true,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ mr: '8px' }}><FiRadio /></SvgIcon>,
    name: 'Play album radio',
    action: PlayActions.PLAY_ALBUM_RADIO,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACKS,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>,
    name: 'Play last',
    action: PlayActions.ADD_TRACKS_LAST,
    shuffle: false,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_ARTIST,
    shuffle: false,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ mr: '8px', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_ARTIST,
    shuffle: true,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ mr: '8px' }}><FiRadio /></SvgIcon>,
    name: 'Play artist radio',
    action: PlayActions.PLAY_ARTIST_RADIO,
    shuffle: false,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACKS,
    shuffle: false,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>,
    name: 'Play last',
    action: PlayActions.ADD_TRACKS_LAST,
    shuffle: false,
  },
  {
    type: 'genre',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_GENRE,
    shuffle: false,
  },
  {
    type: 'genre',
    icon: <SvgIcon sx={{ mr: '8px', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_GENRE,
    shuffle: true,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_PLAYLIST,
    shuffle: false,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ mr: '8px', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_PLAYLIST,
    shuffle: true,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACKS,
    shuffle: false,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>,
    name: 'Play last',
    action: PlayActions.ADD_TRACKS_LAST,
    shuffle: false,
  },
];

export const albumButtons = allButtons.filter((button) => button.type === 'album');

export const artistButtons = allButtons.filter((button) => button.type === 'artist');

export const playlistButtons = allButtons.filter((button) => button.type === 'playlist');

export const trackButtons = allButtons.filter((button) => button.type === 'track');

export const tracksButtons: ButtonSpecs[] = [
  {
    type: 'tracks',
    icon: <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_TRACKS,
    shuffle: false,
  },
  {
    type: 'tracks',
    icon: <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACKS,
    shuffle: false,
  },
  {
    type: 'tracks',
    icon: <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>,
    name: 'Play last',
    action: PlayActions.ADD_TRACKS_LAST,
    shuffle: false,
  },
];
