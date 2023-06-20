import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import chroma, { contrast } from 'chroma-js';
import moment from 'moment';
import React, { useRef } from 'react';
import { BiHash, IoMdMicrophone, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import { Album } from 'api/index';
import { ChipGenres } from 'components/chips';
import { AlbumMenu, MenuIcon } from 'components/menus';
import Palette from 'components/palette/Palette';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import usePlayback from 'hooks/usePlayback';
import { AlbumContext } from './Album';
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

const Header = ({ context }: { context?: AlbumContext }) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });
  const { album: albumData, navigate } = context!;
  const { album } = albumData!;
  const { playAlbum, playSwitch } = usePlayback();
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });
  const { width } = useOutletContext() as { width: number };
  // calculated values
  const [parentThumbSrc] = useThumbnail(album.parentThumb || 'none', 100);
  const [thumbSrc, thumbUrl] = useThumbnail(album.thumb || 'none', 300);
  const [thumbSrcSm] = useThumbnail(album.thumb || 'none', 100);
  const countNoun = album.leafCount > 1 || album.leafCount === 0 ? 'tracks' : 'track';
  const releaseDate = moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');

  const handlePlay = () => playAlbum(album as Album);
  const handleShuffle = () => playAlbum(album as Album, true);

  if (!album) {
    return null;
  }

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          position="fixed"
          width={width}
          zIndex={400}
        >
          <FixedHeader
            album={album}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box maxWidth="900px" mx="auto" ref={ref} width={WIDTH_CALC}>
        <Box alignItems="flex-end" color="text.primary" display="flex" height={232}>
          <Avatar
            alt={album.title}
            src={thumbSrc}
            sx={{
              height: 216, margin: '8px', ml: 0, width: 216,
            }}
            variant="rounded"
          />
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
            <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
              <Box display="flex" height={18}>
                {[...album.format, ...album.subformat].map((item, index, { length }) => {
                  if (length - 1 === index) {
                    return (
                      <Typography key={item.id} variant="subtitle2">
                        {item.tag.toLowerCase()}
                      </Typography>
                    );
                  }
                  return (
                    <Typography key={item.id} variant="subtitle2">
                      {item.tag.toLowerCase()}
                      {' ·'}
                      &nbsp;
                    </Typography>
                  );
                })}
              </Box>
              <Typography sx={titleStyle} variant="h4">{album.title}</Typography>
              <Box alignItems="center" display="flex" height={36}>
                <Palette id={album.thumb} url={thumbUrl}>
                  {({ data: colors, isLoading }) => {
                    let color;
                    let contrastColor;
                    if (colors) {
                      color = chroma(colors.muted).saturate(2).brighten(1).hex();
                      contrastColor = contrast(color, 'black') > contrast(color, 'white')
                        ? 'black'
                        : 'white';
                    }
                    if (isLoading) {
                      return null;
                    }
                    return (
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
                          `/artists/${album.parentId}`,
                          { state: { guid: album.parentGuid, title: album.parentTitle } },
                        )}
                      >
                        <Avatar
                          alt={album.parentTitle}
                          src={album.parentThumb ? parentThumbSrc : undefined}
                          sx={{ width: '32px', height: '32px', ml: '2px' }}
                        >
                          <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
                            <IoMdMicrophone />
                          </SvgIcon>
                        </Avatar>
                        <Typography
                          color={!colors ? 'text.main' : contrastColor}
                          fontSize="0.875rem"
                          ml="8px"
                          mr="12px"
                          whiteSpace="nowrap"
                        >
                          {album.parentTitle}
                        </Typography>
                      </Box>
                    );
                  }}
                </Palette>
              </Box>
              <Box
                display="flex"
                flexWrap="wrap"
                height={22}
                justifyContent="center"
                mt="4px"
                overflow="hidden"
              >
                <Typography fontFamily="Rubik, sans-serif" variant="subtitle2">
                  {`${releaseDate} · ${album.leafCount} ${countNoun}`}
                </Typography>
              </Box>
            </Box>
            <PlayShuffleButton
              handlePlay={handlePlay}
              handleShuffle={handleShuffle}
            />
          </Box>
        </Box>
        <Box alignItems="center" display="flex" justifyContent="space-between" my={1}>
          <Typography color="text.primary">
            {album.viewCount
              ? `${album.viewCount} ${album.viewCount > 1 ? 'plays' : 'play'}`
              : 'unplayed'}
          </Typography>
          <Palette id={album.thumb} url={thumbUrl}>
            {({ data: colors, isLoading }) => {
              if (isLoading) {
                return null;
              }
              return (
                <ChipGenres
                  colors={Object.values(colors!)}
                  genres={album.genre}
                  navigate={navigate}
                />
              );
            }}
          </Palette>
          <MenuIcon
            height={32}
            mb="5px"
            menuRef={menuRef}
            menuState={menuProps.state}
            toggleMenu={toggleMenu}
            width={24}
          />
          <AlbumMenu
            arrow
            portal
            albumLink={false}
            albums={[album]}
            align="center"
            anchorRef={menuRef}
            direction="left"
            playSwitch={playSwitch}
            toggleMenu={toggleMenu}
            {...menuProps}
          />
        </Box>
        <Box
          alignItems="flex-start"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.secondary"
          display="flex"
          height={30}
          width="100%"
        >
          <Box maxWidth="10px" width="10px" />
          <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <BiHash />
            </SvgIcon>
          </Box>
          <Box sx={{ width: '56px' }} />
          <Box sx={{
            width: '50%', flexGrow: 1, display: 'flex', justifyContent: 'flex-end',
          }}
          >
            <span />
          </Box>
          <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiHeartLine />
            </SvgIcon>
          </Box>
          <Box sx={{
            width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
          }}
          >
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiTimeLine />
            </SvgIcon>
          </Box>
          <Box maxWidth="10px" width="10px" />
        </Box>
      </Box>
    </>
  );
};

Header.defaultProps = {
  context: undefined,
};

export default React.memo(Header);
