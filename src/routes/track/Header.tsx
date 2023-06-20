import { Avatar, Box, Fade, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import chroma, { contrast } from 'chroma-js';
import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Library, Track } from 'api/index';
import { MenuIcon, TrackMenu } from 'components/menus';
import TrackRating from 'components/rating/TrackRating';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import { PaletteState } from 'hooks/usePalette';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';
import FixedHeader from './FixedHeader';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
  marginBottom: '5px',
};

interface HeaderProps {
  colors: PaletteState;
  library: Library;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  track: Track;
}

const Header = ({ colors, library, playSwitch, track }: HeaderProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });
  const [grandparentThumbSrc] = useThumbnail(track.grandparentThumb || 'none', 100);
  const [thumbSrc] = useThumbnail(track.parentThumb || 'none', 300);
  const [thumbSrcSm] = useThumbnail(track.parentThumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const color = chroma(colors.muted).saturate(2).brighten(1).hex();
  const contrastColor = contrast(color, 'black') > contrast(color, 'white')
    ? 'black'
    : 'white';

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth={900}
          position="fixed"
          width={WIDTH_CALC}
          zIndex={400}
        >
          <FixedHeader
            thumbSrcSm={thumbSrcSm}
            track={track}
          />
        </Box>
      </Fade>
      <Box
        alignItems="flex-end"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.primary"
        display="flex"
        height={232}
        ref={ref}
      >
        <Avatar
          alt={track.parentTitle}
          src={thumbSrc}
          sx={{
            height: 216, margin: '8px', ml: 0, width: 216,
          }}
          variant="rounded"
        />
        <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
          <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
            <Box display="flex" height={18}>
              <Typography variant="subtitle2">
                track
              </Typography>
            </Box>
            <Typography sx={titleStyle} variant="h4">{track.title}</Typography>
            <Box alignItems="center" display="flex" height={36}>
              <Box
                alignItems="center"
                borderRadius="16px"
                display="flex"
                height="36px"
                sx={{
                  background: !colors ? 'active.selected' : color,
                  cursor: 'pointer',
                  transition: 'box-shadow 200ms ease-in',
                  '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)' },
                }}
                onClick={() => navigate(
                  `/artists/${track.grandparentId}`,
                  { state: { guid: track.grandparentGuid, title: track.grandparentTitle } },
                )}
              >
                <Avatar
                  alt={track.grandparentTitle}
                  src={grandparentThumbSrc}
                  sx={{ width: '32px', height: '32px', ml: '2px' }}
                />
                <Typography
                  color={!colors ? 'text.main' : contrastColor}
                  fontSize="0.875rem"
                  ml="8px"
                  mr="12px"
                  whiteSpace="nowrap"
                >
                  {track.grandparentTitle}
                </Typography>
              </Box>
            </Box>
            <Box alignItems="center" display="flex" flexWrap="wrap" mt="4px">
              <Typography fontFamily="Rubik, sans-serif" mt="4px" variant="subtitle2">
                {track.media[0].audioCodec.toUpperCase()}
                &nbsp;
              </Typography>
              {
                track.media[0].parts[0].streams[0].bitDepth
                && track.media[0].parts[0].streams[0].samplingRate
                && (
                  <Typography fontFamily="Rubik, sans-serif" mt="4px" variant="subtitle2">
                    {track.media[0].parts[0].streams[0].bitDepth}
                    /
                    {track.media[0].parts[0].streams[0].samplingRate.toString().slice(0, 2)}
                  </Typography>
                )
              }
              <Typography mt="4px" variant="subtitle2">
                &nbsp;
                ·
                &nbsp;
              </Typography>
              <TrackRating
                id={track.id}
                library={library}
                userRating={track.userRating / 2 || 0}
              />
            </Box>
          </Box>
        </Box>
        <MenuIcon
          height={32}
          mb="5px"
          menuRef={menuRef}
          menuState={menuProps.state}
          toggleMenu={toggleMenu}
          width={24}
        />
        <TrackMenu
          arrow
          portal
          align="center"
          anchorRef={menuRef}
          direction="left"
          playSwitch={playSwitch}
          toggleMenu={toggleMenu}
          tracks={[track]}
          {...menuProps}
        />
      </Box>
    </>
  );
};

export default Header;
