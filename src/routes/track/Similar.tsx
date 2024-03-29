import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { AnimatePresence } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { throttle } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import { usePrevious } from 'react-use';
import { Library, Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { toastAtom } from 'components/toast/Toast';
import { typographyStyle } from 'constants/style';
import { PlayParams } from 'hooks/usePlayback';
import { useLastfmSimilar } from 'queries/last-fm-queries';
import { getTrackMatch } from 'queries/plex-query-fns';
import { configAtom } from 'root/Root';
import { PlayActions } from 'types/enums';
import { LastFmTrack } from 'types/lastfm-interfaces';

const getColumns = (width: number) => {
  if (width >= 800) {
    return 4;
  }
  if (width < 800 && width >= 600) {
    return 3;
  }
  if (width < 600) {
    return 2;
  }
  return 4;
};

const toTitleCase = (text: string) => {
  if (text === text.toUpperCase()) return text;
  if (text === text.toLowerCase()) return text;
  const newText = text
    .split(' ')
    .filter((n) => n)
    .map(([h, ...t]) => {
      if (h === '(' || h === '[') {
        return h + t[0] + t.slice(1).join('').toLowerCase();
      }
      return h.toUpperCase() + t.join('').toLowerCase();
    })
    .join(' ');
  return newText;
};

interface SimilarProps {
  apikey: string | undefined;
  artist: string | undefined;
  library: Library;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  title: string | undefined;
  width: number;
}

const Similar = ({ apikey, artist, library, playSwitch, title, width }: SimilarProps) => {
  const cols = throttle(() => getColumns(width), 300, { leading: true })();
  const config = useAtomValue(configAtom);
  const hoverIndex = useRef(0);
  const length = (cols || 4) * 4;
  const match = useRef<Track>();
  const setToast = useSetAtom(toastAtom);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const { data: similarTracks, isLoading } = useLastfmSimilar({
    apikey,
    artist,
    title,
  });

  const CARD_WIDTH = useMemo(() => {
    if (!width || !cols) return 200;
    return Math.floor(width / cols);
  }, [cols, width]);

  const handleClick = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    track: LastFmTrack,
  ) => {
    if (hoverIndex.current === index && menuProps.state === 'closing') {
      return;
    }
    match.current = undefined;
    hoverIndex.current = index;
    setAnchorPoint({
      x: event.clientX,
      y: event.clientY,
    });
    const trackMatch = await getTrackMatch({
      artist: track.artist.name,
      title: track.name,
      library,
      sectionId: config.sectionId!,
    });
    if (trackMatch) {
      match.current = trackMatch;
      toggleMenu(true);
      return;
    }
    setToast({ type: 'error', text: 'No matching track found.' });
  };

  if (isLoading) {
    return (
      <>
        <Typography
          color="text.primary"
          fontFamily="TT Commons, sans-serif"
          fontSize="1.625rem"
        >
          Last.fm Similar Tracks
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          height={264}
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!similarTracks || similarTracks.length === 0 || !artist || !title) {
    return (
      <>
        <Typography
          color="text.primary"
          fontFamily="TT Commons, sans-serif"
          fontSize="1.625rem"
        >
          Last.fm Similar Tracks
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          height={264}
          justifyContent="center"
        >
          <Typography
            color="text.primary"
            fontFamily="TT Commons, sans-serif"
            fontWeight={700}
            variant="h4"
          >
            No results!
          </Typography>
          <Typography color="text.primary">
            No similar tracks were found on last.fm.
          </Typography>
        </Box>
      </>
    );
  }

  if (!width || !cols) {
    return null;
  }

  return (
    <>
      <Typography
        color="text.primary"
        fontFamily="TT Commons, sans-serif"
        fontSize="1.625rem"
      >
        Last.fm Similar Tracks
      </Typography>
      <AnimatePresence custom={difference} initial={false} mode="wait">
        <MotionBox
          animate={{ x: 0, opacity: 1 }}
          custom={difference}
          display="flex"
          exit="exit"
          flexWrap="wrap"
          gap="8px"
          initial="enter"
          key={activeIndex}
          minHeight={240}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          <Grid
            container
            className="scroll-container"
            direction="column"
            height={240}
          >
            {similarTracks
              .slice((activeIndex * length), (activeIndex * length + length))
              .map((track, index) => (
                <Grid item color="text.secondary" key={track.url} width={CARD_WIDTH}>
                  <Box
                    alignItems="center"
                    borderRadius="4px"
                    display="flex"
                    height={40}
                    mb="4px"
                    mr="4px"
                    paddingX="12px"
                    paddingY="8px"
                    sx={{
                      backgroundColor: menuProps.state === 'open' && hoverIndex.current === index
                        ? 'action.selected'
                        : 'action.hover',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                    onClick={(event) => handleClick(event, index, track)}
                    onMouseEnter={() => {
                      if (menuProps.state === 'open' || menuProps.state === 'opening') return;
                      hoverIndex.current = index;
                    }}
                  >
                    <AnimatePresence>
                      {(menuProps.state === 'open' || menuProps.state === 'opening')
                        && hoverIndex.current === index
                        && (
                          <MotionBox
                            animate={{ opacity: 1, x: 0 }}
                            bgcolor="primary.main"
                            borderRadius="2px"
                            exit={{ opacity: 0 }}
                            height={28}
                            initial={{ opacity: 0, x: -10 }}
                            mr="8px"
                            width={4}
                          />
                        )}
                    </AnimatePresence>
                    <Box width={0.9}>
                      <Typography
                        color="text.primary"
                        fontFamily="Rubik, sans-serif"
                        fontSize="0.95rem"
                        sx={typographyStyle}
                      >
                        {toTitleCase(track.name)}
                      </Typography>
                      <Typography fontSize="0.875rem" sx={typographyStyle}>
                        {track.artist.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </MotionBox>
      </AnimatePresence>
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={match.current ? [match.current] : undefined}
        {...menuProps}
      />
      <PaginationDots
        activeIndex={activeIndex}
        array={similarTracks}
        colLength={cols * 4}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
};

export default Similar;
