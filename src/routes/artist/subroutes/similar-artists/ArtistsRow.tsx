import { Box, Collapse, SvgIcon, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import { FaAngleDown, IoMdMicrophone } from 'react-icons/all';
import styles from 'styles/AlbumsRow.module.scss';
import CollapseContent from './CollapseContent';
import { RowProps, SimilarArtistContext } from './SimilarArtists';

const textStyle = {
  bottom: '8px',
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  height: '20px',
  lineHeight: 1.2,
  overflow: 'hidden',
  position: 'absolute',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

interface ArtistCardProps {
  artist: Artist;
  context: SimilarArtistContext;
  index: number;
  rowIndex: number;
}

const ArtistCard = ({ artist, context, index, rowIndex }: ArtistCardProps) => {
  const {
    grid, library, openArtist, width, openCard, setOpenArtist, setOpenCard,
  } = context;
  const imgHeight = Math.floor((width * 0.89) / grid.cols) * 0.70;
  const imgWidth = Math.floor((width * 0.89) / grid.cols);
  const open = openArtist.id === artist.id;
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: artist.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  const handleClick = () => {
    if (openCard.row === rowIndex && openCard.index === index) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
      setOpenCard({ row: -1, index: -1 });
      return;
    }
    if (openCard.row === rowIndex) {
      setOpenArtist({
        id: artist.id,
        guid: artist.guid,
        title: artist.title,
      });
    }
    setOpenCard({ row: rowIndex, index });
  };

  return (
    <Box
      className={styles['album-box']}
      data-id={artist.id}
      height={imgHeight + 28}
      key={artist.id}
      sx={{
        contain: 'paint',
      }}
      width={imgWidth}
      onClick={handleClick}
    >
      <Box
        bgcolor="action.selected"
        className={styles['album-cover']}
        flexDirection="column-reverse"
        height={imgHeight - 8}
        margin="4px"
        style={{
          borderRadius: '32px',
          transform: open ? 'scale(1) translateZ(0px)' : '',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        width={imgWidth - 8}
      >
        {!artist.thumb && (
          <SvgIcon
            className="generic-artist"
            sx={{ alignSelf: 'center', color: 'common.grey', height: '65%', width: '65%' }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        )}
      </Box>
      <Typography
        sx={{
          ...textStyle,
          opacity: open ? 0 : 1,
          textAlign: 'center',
          transition: '200ms',
          width: Math.floor((imgWidth - 16) * 0.95),
        }}
      >
        {artist.title}
      </Typography>
      <SvgIcon
        className={open ? styles.open : ''}
        sx={{
          bottom: '28px',
          color: 'common.white',
          filter: 'drop-shadow(0px 0px 1px rgb(0 0 0 / 0.8))',
          position: 'absolute',
          width: '100%',
        }}
        viewBox="1 0 24 24"
      >
        <FaAngleDown />
      </SvgIcon>
    </Box>
  );
};

const getCaretPos = (cols: number, openIndex: number, width: number) => {
  const colWidth = Math.floor((width * 0.89) / cols);
  return (colWidth * openIndex) + (colWidth / 2);
};

const ArtistsRow = React.memo(({ index: rowIndex, context }: RowProps) => {
  const {
    grid,
    height,
    items: { rows },
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    setOpen,
    setOpenArtist,
    virtuoso,
    width,
  } = context;
  const { artists } = rows![rowIndex];
  const panelHeight = height - 72 - (Math.floor((width * 0.89) / grid.cols) * 0.70) - 40;

  const openIndex = openCard.index;
  const caretPos = getCaretPos(grid.cols, openIndex, width);

  const handleEntered = () => {
    virtuoso.current?.scrollToIndex({ index: rowIndex, behavior: 'smooth' });
    if (openArtist.id === artists[openIndex].id) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
      setOpen(true);
      return;
    }
    setOpenArtist({
      id: artists[openIndex].id,
      guid: artists[openIndex].guid,
      title: artists[openIndex].title,
    });
    setOpen(true);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        mx="auto"
        width={(width * 0.89)}
      >
        {artists.map((artist, index) => (
          <ArtistCard
            artist={artist}
            context={context}
            index={index}
            key={artist.id}
            rowIndex={rowIndex}
          />
        ))}
      </Box>
      <Collapse
        in={openCard.row === rowIndex}
        onEntered={handleEntered}
        onExit={() => setOpen(false)}
      >
        <Box
          bgcolor="common.contrastGrey"
          border="1px solid"
          borderColor="border.main"
          borderRadius="24px"
          height={panelHeight}
          margin="auto"
          maxHeight={380}
          sx={{
            transform: 'translateZ(0px)',
          }}
          width="89%"
        >
          <Box
            bgcolor="common.contrastGrey"
            height={18}
            position="absolute"
            sx={{
              border: '1px solid transparent',
              borderTopColor: 'border.main',
              borderLeftColor: 'border.main',
              left: caretPos,
              overflow: 'hidden',
              top: '-14px',
              transform: 'rotate(45deg)',
              transformOrigin: 'top left',
            }}
            width={18}
          />
          {openArtist && open && openArtistQuery.data && openArtistTracksQuery.data && (
            <CollapseContent
              context={context}
              panelHeight={panelHeight}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

export default ArtistsRow;
