import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
} from '@szhsin/react-menu';
import { useSetAtom } from 'jotai';
import React, { useCallback } from 'react';
import { MdPlaylistAdd } from 'react-icons/md';
import { RiHistoryFill } from 'react-icons/ri';
import { TbWaveSawTool } from 'react-icons/tb';
import { TiInfoLarge } from 'react-icons/ti';
import { NavLink, useNavigate } from 'react-router-dom';
import { Artist, Track } from 'api/index';
import { ButtonSpecs, trackButtons, tracksButtons } from 'constants/buttons';
import useArtistMatch from 'hooks/useArtistMatch';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';
import { addToPlaylistAtom } from 'ui/footer/drawers/AddToPlaylistDrawer';
import AlbumMenuItem from './menu-items/AlbumMenuItem';
import ArtistMenuItem from './menu-items/ArtistMenuItem';

const TrackMenu: React.FC<ControlledMenuProps & {
  playNow?: () => Promise<void>,
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>,
  toggleMenu: (open?: boolean | undefined) => void,
  tracks: Track[] | undefined,
}> = ({
  children,
  playNow,
  playSwitch,
  toggleMenu,
  tracks,
  ...props
}) => {
  const artists = useArtistMatch({
    name: tracks && tracks.length === 1
      ? tracks[0].originalTitle || tracks[0].grandparentTitle
      : '',
  });
  const navigate = useNavigate();
  const setItems = useSetAtom(addToPlaylistAtom);

  const handleArtistNavigate = (artist: Artist) => {
    const state = { guid: artist.guid, title: artist.title };
    navigate(`/artists/${artist.id}`, { state });
  };

  const handleTrackNavigate = (track: Track) => {
    const state = { guid: track.grandparentId, title: track.grandparentTitle };
    navigate(`/artists/${track.grandparentId}`, { state });
  };

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!tracks) {
      return;
    }
    if (tracks.length === 1) {
      const [track] = tracks;
      if (button.action === PlayActions.PLAY_TRACK && !!playNow) {
        await playNow();
        return;
      }
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (tracks.length > 1) {
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  }, [playNow, playSwitch, tracks]);

  if (!tracks) return null;

  return (
    <ControlledMenu
      portal
      boundingBoxPadding="10"
      submenuCloseDelay={0}
      submenuOpenDelay={0}
      onClose={() => toggleMenu(false)}
      {...props}
    >
      {tracks.length === 1 && trackButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      {tracks.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem
        onClick={() => setItems(tracks)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      {tracks.length === 1 && (
        <>
          <MenuItem
            onClick={() => navigate(`/tracks/${tracks[0].id}/similar`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar tracks
          </MenuItem>
          <MenuItem onClick={() => navigate(`/history/${tracks[0].id}`)}>
            <SvgIcon sx={{ mr: '8px' }}><RiHistoryFill /></SvgIcon>
            View play history
          </MenuItem>
          <NavLink className="nav-link" to={`/tracks/${tracks[0].id}`}>
            {({ isActive }) => (
              <>
                {!isActive && (
                  <MenuItem>
                    <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
                    Track details
                  </MenuItem>
                )}
              </>
            )}
          </NavLink>
          {
            tracks[0].grandparentTitle === 'Various Artists'
            && artists.length === 1
            && (
              <>
                <MenuDivider />
                {artists.map((artist) => (
                  <ArtistMenuItem
                    key={artist.id}
                    thumb={artist.thumb}
                    title={artist.title}
                    onClick={() => handleArtistNavigate(artist)}
                  />
                ))}
              </>
            )
          }
          {
            (artists.length === 0 || artists.length === 1)
            && tracks[0].grandparentTitle !== 'Various Artists'
            && (
              <>
                <MenuDivider />
                <ArtistMenuItem
                  thumb={tracks[0].grandparentThumb}
                  title={tracks[0].grandparentTitle}
                  onClick={() => handleTrackNavigate(tracks[0])}
                />
              </>
            )
          }
          {
            artists.length > 1
            && (
              <>
                <MenuDivider />
                {artists.map((artist) => (
                  <ArtistMenuItem
                    key={artist.id}
                    thumb={artist.thumb}
                    title={artist.title}
                    onClick={() => handleArtistNavigate(artist)}
                  />
                ))}
              </>
            )
          }
          <NavLink className="nav-link" to={`/albums/${tracks[0].parentId}`}>
            {({ isActive }) => (
              <>
                {!isActive && (
                  <>
                    <MenuDivider />
                    <AlbumMenuItem
                      thumb={tracks[0].parentThumb}
                      title={tracks[0].parentTitle}
                    />
                  </>
                )}
              </>
            )}
          </NavLink>
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

TrackMenu.defaultProps = {
  playNow: undefined,
};

export default TrackMenu;
