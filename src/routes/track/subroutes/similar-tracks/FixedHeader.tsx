import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { Track } from 'hex-plex';
import { IoMdMicrophone } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';

interface FixedHeaderProps {
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  thumbSrcSm: string;
  track: Track;
}

const FixedHeader = ({
  handlePlay, handleShuffle, thumbSrcSm, track,
}: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="888px"
    paddingX="6px"
    width="calc(89% - 12px)"
  >
    <Avatar
      alt={track.title}
      src={track.thumb ? thumbSrcSm : ''}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
    >
      <SvgIcon
        className="generic-artist"
        sx={{ alignSelf: 'center', color: 'common.black', height: '65%', width: '65%' }}
      >
        <IoMdMicrophone />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      fontFamily="TT Commons"
      fontSize="1.75rem"
      fontWeight={600}
      ml="10px"
      variant="h5"
      width={1}
    >
      <NavLink
        className="link"
        to={`/albums/${track.parentId}`}
      >
        {track.title}
      </NavLink>
      &nbsp;&nbsp;»&nbsp;&nbsp;
      Similar Tracks
    </Typography>
    <PlayShuffleButton
      handlePlay={handlePlay}
      handleShuffle={handleShuffle}
    />
  </Box>
);

export default FixedHeader;