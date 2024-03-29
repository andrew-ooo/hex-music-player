import {
  Box, BoxProps, Fab, IconButton, SvgIcon,
} from '@mui/material';
import { FiRadio } from 'react-icons/fi';
import { RiPlayFill, RiShuffleFill } from 'react-icons/ri';
import { MotionBox } from 'components/motion-components/motion-components';
import useKeyPress from 'hooks/useKeyPress';

const { platform } = window.electron.getAppInfo();

interface PlayShuffleButtonProps extends BoxProps {
  handlePlay: () => Promise<void>;
  handleRadio?: () => Promise<void> | undefined;
  handleShuffle: () => Promise<void>;
}

const PlayShuffleButton = ({
  handlePlay,
  handleRadio,
  handleShuffle,
  ...rest
}: PlayShuffleButtonProps) => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  return (
    <Box
      alignItems="center"
      display="flex"
      flexShrink={0}
      height={60}
      justifyContent="center"
      marginLeft="auto"
      sx={{ transform: 'translateZ(0px)' }}
      width={60}
      {...rest}
    >
      <MotionBox
        transition={{ type: 'spring', stiffness: 100 }}
        whileHover={{ scale: [null, 1.2, 1.1] }}
      >
        <Fab
          color="primary"
          size="medium"
          sx={{
            boxShadow: 'var(--mui-shadows-2)',
            zIndex: 0,
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
        >
          <SvgIcon sx={{ width: '1.3em', height: '1.3em', color: 'background.default' }}>
            <RiPlayFill />
          </SvgIcon>
        </Fab>
      </MotionBox>
      <MotionBox
        sx={{
          position: 'absolute',
          right: '3px',
          bottom: '3px',
        }}
        transition={{ type: 'spring', stiffness: 100 }}
        whileHover={{ scale: [null, 1.2, 1.1] }}
      >
        <IconButton
          sx={{
            width: '22px',
            height: '22px',
            color: 'primary.main',
            backgroundColor: 'background.default',
            boxShadow: 'var(--mui-shadows-2)',
            '&:hover': {
              color: 'primary.light',
              backgroundColor: 'background.default',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleShuffle();
          }}
        >
          <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
            <RiShuffleFill />
          </SvgIcon>
        </IconButton>
      </MotionBox>
      <MotionBox
        sx={{
          position: 'absolute',
          right: '3px',
          bottom: '3px',
        }}
        transition={{ type: 'spring', stiffness: 100 }}
        whileHover={{ scale: [null, 1.3, 1.2] }}
      >
        {ctrlPress && !!handleRadio && (
          <IconButton
            sx={{
              width: '22px',
              height: '22px',
              color: 'primary.main',
              backgroundColor: 'background.default',
              boxShadow: 'var(--mui-shadows-2)',
              '&:hover': {
                color: 'primary.light',
                backgroundColor: 'background.default',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleRadio();
            }}
          >
            <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
              <FiRadio />
            </SvgIcon>
          </IconButton>
        )}
      </MotionBox>
    </Box>
  );
};

PlayShuffleButton.defaultProps = {
  handleRadio: undefined,
};

export default PlayShuffleButton;
