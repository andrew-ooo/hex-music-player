import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { Moment } from 'moment';
import { TiChartLine } from 'react-icons/ti';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';

interface FixedHeaderProps {
  color: string;
  days: number;
  start: Moment;
  end: Moment;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
}

const FixedHeader = ({ color, days, end, handlePlay, handleShuffle, start }: FixedHeaderProps) => (
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
      alt="Chart"
      sx={{
        background: `linear-gradient(to bottom right, ${color}, ${color}99)`,
        width: 60,
        height: 60,
      }}
      variant="rounded"
    >
      <SvgIcon sx={{ height: 40, width: 40 }}>
        <TiChartLine />
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
      Top Tracks&nbsp;&nbsp;»&nbsp;&nbsp;
      {days !== 0 && `Last ${days} days`}
      {days === 0 && (
        <span>
          {start.format('DD MMM YYYY')}
          &nbsp;&nbsp;–&nbsp;&nbsp;
          {end.format('DD MMM YYYY')}
        </span>
      )}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;