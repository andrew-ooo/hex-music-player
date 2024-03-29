import {
  Box, Collapse, InputAdornment, InputBase, ListSubheader, SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { RiSendPlaneLine } from 'react-icons/ri';
import { TiPlus } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import { toastAtom } from 'components/toast/Toast';
import { useCreatePlaylist } from 'hooks/playlistHooks';
import { QueryKeys } from 'types/enums';

interface PlaylistSubheaderProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaylistSubheader = ({ show, setShow }: PlaylistSubheaderProps) => {
  const queryClient = useQueryClient();
  const createPlaylist = useCreatePlaylist();
  const navigate = useNavigate();
  const setToast = useSetAtom(toastAtom);
  const [title, setTitle] = useState('');

  useEffect(() => () => setTitle(''), [show]);

  const handleSubmit = async (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    const response = await createPlaylist(title);
    if (response.size > 0) {
      const [newPlaylist] = response.playlists;
      setShow(false);
      await queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
      navigate(`/playlists/${newPlaylist.id}`);
      setToast({ type: 'success', text: 'Playlist created' });
    }
    if (response.size === 0) {
      setShow(false);
      setToast({ type: 'error', text: 'Failed to create playlist' });
    }
  };

  return (
    <>
      <ListSubheader
        sx={{
          lineHeight: '20px',
          fontSize: '0.75rem',
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
        }}
      >
        Playlists
        <Box
          sx={{ '&:hover': { color: 'primary.main', cursor: 'pointer' } }}
          title="Create playlist"
          onClick={() => setShow(!show)}
        >
          <TiPlus />
        </Box>
      </ListSubheader>
      <Collapse in={show}>
        <Box
          borderRadius="4px"
          component="form"
          height="32px"
          marginX="14px"
          sx={{
            backgroundColor: 'var(--mui-palette-action-disabledBackground)',
          }}
          onSubmit={handleSubmit}
        >
          <InputBase
            fullWidth
            endAdornment={(
              <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={handleSubmit}>
                <SvgIcon sx={{
                  mr: '12px',
                  color: 'text.secondary',
                  height: '18px',
                  width: '18px',
                  transform: 'rotate(45deg)',
                }}
                >
                  <RiSendPlaneLine />
                </SvgIcon>
              </InputAdornment>
            )}
            inputProps={{ style: { padding: '4px 8px 4px' }, spellCheck: false }}
            placeholder="Create playlist..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>
      </Collapse>
    </>
  );
};

export default PlaylistSubheader;
