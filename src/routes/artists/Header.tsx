import {
  Box, Fade, Typography,
} from '@mui/material';
import { useInView } from 'react-intersection-observer';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { ArtistsContext } from './Artists';
import FixedHeader from './FixedHeader';

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistsContext }) => {
  const { measurements, playUri, uri } = context!;
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const handlePlay = () => playUri(uri, false);
  const handleShuffle = () => playUri(uri, true);

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            width={measurements.ROW_WIDTH}
          />
        </Box>
      </Fade>
      <Box
        maxWidth="1600px"
        mb="1px"
        mx="auto"
        ref={ref}
        width={measurements.ROW_WIDTH}
      >
        <Box
          alignItems="center"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.primary"
          display="flex"
          height={70}
          paddingX="6px"
        >
          <Typography variant="h1">Artists</Typography>
          <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
        </Box>
      </Box>
    </>
  );
};

export default Header;
