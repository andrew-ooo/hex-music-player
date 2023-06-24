import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Fade,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { BiHash } from 'react-icons/bi';
import { BsMusicNoteList } from 'react-icons/bs';
import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';
import { RiHeartLine, RiTimeLine } from 'react-icons/ri';
import { RxCheck } from 'react-icons/rx';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import { Playlist } from 'api/index';
import { plexSort } from 'classes';
import { ChipFilter, ChipSelect } from 'components/chips';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import usePlayback from 'hooks/usePlayback';
import { SortOrders } from 'types/enums';
import FixedHeader from './FixedHeader';
import { PlaylistContext } from './Playlist';

const sortOptions = [
  { label: 'Album', sortKey: 'parentTitle' },
  { label: 'Artist', sortKey: 'grandparentTitle' },
  { label: 'Date Added', sortKey: 'addedAt' },
  { label: 'Duration', sortKey: 'duration' },
  { label: 'Last Played', sortKey: 'lastViewedAt' },
  { label: 'Last Rated', sortKey: 'lastRatedAt' },
  { label: 'Playcount', sortKey: 'viewCount' },
  { label: 'Popularity', sortKey: 'ratingCount' },
  { label: 'Rating', sortKey: 'userRating' },
  { label: 'Title', sortKey: 'title' },
  { label: 'Year', sortKey: 'parentYear' },
];

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
};

const Header = ({ context }: { context?: PlaylistContext | undefined }) => {
  const { filter, playlist, setFilter, setSort, sort } = context!;
  const chipRef = useRef<HTMLDivElement | null>(null);
  const { playPlaylist } = usePlayback();
  const { width } = useOutletContext() as { width: number };
  const countNoun = playlist!.leafCount > 1 || playlist!.leafCount === 0 ? 'tracks' : 'track';
  const [open, setOpen] = useState(false);
  const [thumbSrc] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 300);
  const [thumbSrcSm] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 100);
  const { ref, inView, entry } = useInView({
    threshold: [0.99, 0],
  });

  const maxWidth = 900;
  const tooltipMaxWidth = Math.min(maxWidth, width - VIEW_PADDING)
    - 20 // x-padding + tooltip offset
    - (chipRef.current?.clientWidth || 0);

  const handlePlay = () => playPlaylist(playlist as Playlist);
  const handleShuffle = () => playPlaylist(playlist as Playlist, true);

  const handleSort = (sortKey: string) => {
    setOpen(false);
    if (sortKey === 'index') {
      setSort(plexSort('index', SortOrders.DESC));
      return;
    }
    if (sort.by === sortKey) {
      const newSort = sort.reverseOrder();
      setSort(newSort);
      return;
    }
    const newSort = sort.setBy(sortKey);
    setSort(newSort);
  };

  if (!playlist) {
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
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            playlist={playlist}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box maxWidth={maxWidth} mx="auto" ref={ref} width={WIDTH_CALC}>
        <Box
          alignItems="flex-end"
          borderRadius="24px"
          color="text.primary"
          display="flex"
          height={272}
          position="relative"
          sx={{
            backgroundImage:
            /* eslint-disable max-len */
            `radial-gradient(circle at 115% 85%, rgba(var(--mui-palette-action-activeChannel) / 0.03), rgba(var(--mui-palette-action-activeChannel) / 0.08) 40%),
              radial-gradient(circle at 5% 5%, rgba(var(--mui-palette-action-activeChannel) / 0.01), rgba(var(--mui-palette-action-activeChannel) / 0.03) 70%)`,
            /* eslint-enable max-len */
          }}
          top={8}
        >
          <Avatar
            alt={playlist.title}
            src={playlist.thumb || playlist.composite
              ? thumbSrc
              : undefined}
            sx={{
              height: 236,
              m: '18px',
              width: 236,
            }}
            variant="rounded"
          >
            <SvgIcon
              sx={{
                alignSelf: 'center',
                color: 'common.black',
                height: '65%',
                width: '65%',
              }}
            >
              <BsMusicNoteList />
            </SvgIcon>
          </Avatar>
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="12px">
            <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
              <Box display="flex" height={18}>
                <Typography variant="subtitle2">
                  playlist
                </Typography>
              </Box>
              <Typography
                sx={titleStyle}
                variant="h4"
              >
                {playlist.title}
              </Typography>
              <Box alignItems="flex-end" display="flex" flexWrap="wrap" mt="4px">
                <Typography
                  fontFamily="Rubik, sans-serif"
                  sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                  variant="subtitle2"
                  width="fit-content"
                >
                  {`${playlist.leafCount} ${countNoun}`}
                </Typography>
              </Box>
            </Box>
            <PlayShuffleButton
              handlePlay={handlePlay}
              handleShuffle={handleShuffle}
              mr="10px"
            />
          </Box>
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height={72}
          justifyContent="space-between"
          mt={1}
        >
          <SelectTooltip
            maxWidth={tooltipMaxWidth}
            open={open}
            placement="right"
            title={(
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <ChipSelect maxWidth={tooltipMaxWidth}>
                  <Chip
                    color="default"
                    label={(
                      <Box alignItems="center" display="flex">
                        Default Order
                        {sort.by === 'index' && (
                          <SvgIcon viewBox="0 0 16 24">
                            <RxCheck />
                          </SvgIcon>
                        )}
                      </Box>
                    )}
                    sx={{ fontSize: '0.9rem' }}
                    onClick={() => handleSort('index')}
                  />
                  <Box bgcolor="border.main" flexShrink={0} height={32} width="1px" />
                  {sortOptions.map((option) => (
                    <Chip
                      color="default"
                      key={option.sortKey}
                      label={(
                        <Box alignItems="center" display="flex">
                          {option.label}
                          {sort.by === option.sortKey && (
                            <SvgIcon viewBox="0 0 16 24">
                              {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
                            </SvgIcon>
                          )}
                        </Box>
                      )}
                      sx={{ fontSize: '0.9rem' }}
                      onClick={() => handleSort(option.sortKey)}
                    />
                  ))}
                </ChipSelect>
              </ClickAwayListener>
            )}
          >
            <Chip
              color="primary"
              label={(
                <>
                  {sort.by === 'index' && (
                    <Box alignItems="center" display="flex">
                      Default Order
                      <SvgIcon viewBox="0 0 16 24">
                        <RxCheck />
                      </SvgIcon>
                    </Box>
                  )}
                  {sort.by !== 'index' && (
                    <Box alignItems="center" display="flex">
                      {sortOptions.find((option) => option.sortKey === sort.by)?.label}
                      <SvgIcon viewBox="0 0 16 24">
                        {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
                      </SvgIcon>
                    </Box>
                  )}
                </>
              )}
              ref={chipRef}
              sx={{ fontSize: '0.9rem' }}
              onClick={() => setOpen(true)}
            />
          </SelectTooltip>
          <ChipFilter
            filter={filter}
            setFilter={setFilter}
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
          <Box
            sx={{
              alignItems: 'center',
              width: '50%',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          />
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

export default Header;
