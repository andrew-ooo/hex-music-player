import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { VIEW_PADDING } from 'constants/measures';
import ArtistCard from './ArtistCard';
import type { Artist, Library } from 'hex-plex';

interface ArtistHighlightsProps {
  artists: Artist[];
  cols: number;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const ArtistHighlights = ({
  artists, cols, library, navigate, width,
}: ArtistHighlightsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const artistPage = artists
    .slice((activeIndex * cols), (activeIndex * cols + cols));
  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: Math.floor(((width - VIEW_PADDING) / cols) * 0.70) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, width]);

  return (
    <>
      <AnimatePresence custom={difference} initial={false} mode="wait">
        <MotionBox
          animate={{ x: 0, opacity: 1 }}
          custom={difference}
          display="flex"
          exit="exit"
          gap="8px"
          height={measurements.ROW_HEIGHT}
          initial="enter"
          key={activeIndex}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          {artistPage.map((artist) => (
            <ArtistCard
              artist={artist}
              handleContextMenu={() => {}}
              key={artist.id}
              library={library}
              measurements={measurements}
              menuTarget={[]}
              navigate={navigate}
            />
          ))}
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={artists}
        colLength={cols}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
};

export default ArtistHighlights;