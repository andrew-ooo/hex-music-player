import { Box, Collapse, SvgIcon } from '@mui/material';
import React from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { Artist } from 'api/index';
import ArtistCard from 'components/artist/ArtistCard';
import ArtistPreview from 'components/artist/ArtistPreview';
import { VIEW_PADDING } from 'constants/measures';
import styles from 'styles/MotionImage.module.scss';
import { RowProps } from './Artists';

const getCaretPos = (cols: number, openIndex: number, width: number) => {
  const colWidth = Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols));
  return (((colWidth * openIndex) + (8 * openIndex) + (colWidth / 2)) - 1);
};

const Row = ({ artists, context, index: rowIndex }: RowProps) => {
  const {
    grid,
    library,
    handleContextMenu,
    measurements,
    menuTarget,
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    playSwitch,
    setOpen,
    setOpenArtist,
    setOpenCard,
    sortBy,
    virtuoso,
    width,
  } = context;

  const openIndex = openCard.index;
  const caretPos = getCaretPos(grid.cols, openIndex, width);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    artist: Artist,
    colIndex: number,
  ) => {
    if (openCard.row === rowIndex && openCard.index === colIndex) {
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
    if (openCard.row !== rowIndex) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
    }
    setOpenCard({ row: rowIndex, index: colIndex });
  };

  const handleEntered = (index: number) => {
    virtuoso.current?.scrollToIndex({
      behavior: 'smooth',
      index,
      offset: -72,
    });
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
        gap="8px"
        height={measurements.ROW_HEIGHT + 8}
        mx="auto"
        width={measurements.ROW_WIDTH}
      >
        {artists.map((artist, colIndex) => (
          <ArtistCard
            artist={artist}
            handleContextMenu={handleContextMenu}
            key={artist.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            metaText={sortBy}
            open={openArtist.id === artist.id}
            onClick={(e) => handleClick(e, artist, colIndex)}
          >
            <SvgIcon
              className={openArtist.id === artist.id ? styles.open : ''}
              sx={{
                bottom: '-2px',
                color: 'common.white',
                filter: 'drop-shadow(0px 0px 1px rgb(0 0 0 / 0.8))',
                position: 'absolute',
                width: '100%',
              }}
              viewBox="1 0 24 24"
            >
              <BiChevronDown />
            </SvgIcon>
          </ArtistCard>
        ))}
      </Box>
      <Collapse
        in={openCard.row === rowIndex}
        onEntered={() => handleEntered(rowIndex)}
        onExit={() => setOpen(false)}
      >
        <Box
          borderTop="1px solid var(--mui-palette-border-main)"
          height={320}
          margin="auto"
          marginBottom="8px"
          sx={{
            transform: 'translateZ(0px)',
          }}
          width={measurements.ROW_WIDTH}
        >
          <Box
            bgcolor="background.paper"
            height={18}
            position="absolute"
            sx={{
              borderLeft: '1px solid var(--mui-palette-border-main)',
              borderTop: '1px solid var(--mui-palette-border-main)',
              left: caretPos,
              overflow: 'hidden',
              top: '-14px',
              transform: 'rotate(45deg)',
              transformOrigin: 'top left',
            }}
            width={18}
          />
          {openArtist && open && openArtistQuery.data && openArtistTracksQuery.data && (
            <ArtistPreview
              library={library}
              openArtist={openArtist}
              openArtistQuery={openArtistQuery}
              openArtistTracksQuery={openArtistTracksQuery}
              playSwitch={playSwitch}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(Row);
