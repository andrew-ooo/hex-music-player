import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
} from '@szhsin/react-menu';
import { useCallback } from 'react';
import { BsMusicNoteList } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { NavLink } from 'react-router-dom';
import { Playlist } from 'api/index';
import { ButtonSpecs, playlistButtons } from 'constants/buttons';
import { useDeletePlaylist } from 'hooks/playlistHooks';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';

interface PlaylistMenuProps extends ControlledMenuProps{
  playlists: Playlist[] | undefined;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
}

const PlaylistMenu = ({
  children,
  playlists,
  playSwitch,
  toggleMenu,
  ...props
}: PlaylistMenuProps) => {
  const deletePlaylist = useDeletePlaylist();

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!playlists) {
      return;
    }
    if (playlists.length === 1) {
      const [playlist] = playlists;
      await playSwitch(button.action, { playlist, shuffle: button.shuffle });
    }
  }, [playSwitch, playlists]);

  if (!playlists || playlists.length === 0) return null;

  return (
    <ControlledMenu
      portal
      onClose={() => toggleMenu(false)}
      {...props}
      boundingBoxPadding="10"
    >
      {playlistButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <NavLink className="nav-link" to={`/playlists/${playlists[0].id}`}>
        {({ isActive }) => (
          <>
            {!isActive && (
              <>
                <MenuDivider />
                <MenuItem>
                  <SvgIcon sx={{ mr: '8px', height: '0.9em' }}><BsMusicNoteList /></SvgIcon>
                  Go to playlist
                </MenuItem>
              </>
            )}
          </>
        )}
      </NavLink>
      {children}
      <MenuDivider />
      <MenuItem
        className="error"
        onClick={() => deletePlaylist(playlists[0].id)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
        Delete
      </MenuItem>
    </ControlledMenu>
  );
};

export default PlaylistMenu;
