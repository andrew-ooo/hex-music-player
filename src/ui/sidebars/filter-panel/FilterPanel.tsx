import {
  Box, Chip, Collapse, InputAdornment, InputBase, SvgIcon, Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdOutlinePlaylistAddCheck } from 'react-icons/md';
import { RiSendPlaneLine } from 'react-icons/ri';
import { PlexSort } from 'classes';
import { configAtom, libraryAtom, serverAtom } from 'root/Root';
import { albumSortingAtom } from 'routes/albums/Albums';
import { artistSortingAtom } from 'routes/artists/Artists';
import { trackSortingAtom } from 'routes/tracks/Tracks';
import { QueryKeys } from 'types/enums';
import { Rating } from './filter-inputs/FilterRating';
import { FilterTypes, Operators } from './filterSchemas';
import AddFilter from './InputFilter';
import AddLimit, { limitAtom } from './InputLimit';
import SortSelect from './InputSort';

export const filtersAtom = atom<Filter[]>([]);

const operatorMap = {
  tag: {
    is: '',
    'is not': '!',
  },
  int: {
    is: '',
    'is not': '!',
    'is greater than': '>>',
    'is less than': '<<',
  },
  str: {
    contains: '',
    'does not contain': '!',
    is: '=',
    'is not': '!=',
    'begins with': '<',
    'ends with': '>',
  },
  bool: {
    is: '',
    'is not': '!',
  },
  datetime: {
    'is before': '<<',
    'is after': '>>',
    'is in the last': '>>',
    'is not in the last': '<<',
  },
};

const pathnameMap: Record<string, number> = {
  artists: 8,
  albums: 9,
  tracks: 10,
};

const addFiltersToParams = (filters: Filter[], params: URLSearchParams) => {
  filters.forEach((filter) => params
    .append(
      // @ts-ignore
      `${filter.group.toLowerCase()}.${filter.field}${operatorMap[filter.type][filter.operator]}`,
      `${filter.value}`,
    ));
};

export interface Filter {
  type: FilterTypes;
  group: 'Artist' | 'Album' | 'Track';
  field: string;
  label: string;
  operator: Operators;
  value: string | number | undefined;
  display: string | number | undefined;
  hash: string;
}

const FilterPanel = ({ pathname }: { pathname: string }) => {
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const limit = useAtomValue(limitAtom);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const server = useAtomValue(serverAtom);
  const type = pathnameMap[pathname.substring(1)];

  const albumSorting = useAtomValue(albumSortingAtom);
  const artistSorting = useAtomValue(artistSortingAtom);
  const trackSorting = useAtomValue(trackSortingAtom);

  const [error, setError] = useState(false);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (filters.length === 0) setShow(false);
  }, [filters]);

  const handleRemoveFilter = (filterHash: string) => {
    const newFilters = filters.filter((filter) => filter.hash !== filterHash);
    setFilters(newFilters);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    let sorting;
    let sortType: 'artist' | 'album' | 'track';
    if (type === 8) {
      sorting = artistSorting;
      sortType = 'artist';
    }
    if (type === 9) {
      sorting = albumSorting;
      sortType = 'album';
    }
    if (type === 10) {
      sorting = trackSorting;
      sortType = 'track';
    }
    addFiltersToParams(filters, params);
    if (sorting) {
      const sortString = sorting
        .map((columnSort) => PlexSort.parseColumnSort(columnSort, sortType).stringify())
        .join(',');
      params.append('sort', sortString);
    }
    if (limit) {
      params.append('limit', limit);
    }
    /* eslint-disable max-len */
    const uri = `${server.uri}/library/sections/${config.sectionId!}/all?type=${type}&${params.toString()}`;
    /* eslint-enable max-len */
    await library.createSmartPlaylist(title, uri);
    queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
    setShow(false);
    setTitle('');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={1}
      marginBottom="4px"
      marginLeft="4px"
      overflow="hidden"
      ref={panelRef}
    >
      <Box
        alignItems="center"
        borderRadius="4px"
        color="text.primary"
        display="flex"
        justifyContent="flex-end"
        paddingY="8px"
        width={1}
      >
        <Typography fontSize="1.5rem" fontWeight={600} mr="8px">Filters + Sorting</Typography>
      </Box>
      <Box alignItems="center" mr="8px">
        <Typography fontFamily="TT Commons" variant="overline">
          Sorting
        </Typography>
        {pathname === '/albums' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
        {pathname === '/artists' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
        {pathname === '/tracks' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
      </Box>
      <Box alignItems="center" mr="8px">
        <Typography fontFamily="TT Commons" variant="overline">
          Limit
        </Typography>
        <AddLimit />
      </Box>
      <Box display="flex" flexDirection="column" mr="8px">
        <Typography alignItems="center" display="flex" fontFamily="TT Commons" variant="overline">
          Filters
          <SvgIcon
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              marginLeft: 'auto',
              pointerEvents: filters.length === 0 ? 'none' : '',
              '&:hover': {
                color: 'text.primary',
              },
            }}
            onClick={() => setShow(!show)}
          >
            <MdOutlinePlaylistAddCheck />
          </SvgIcon>
        </Typography>
        <Collapse in={show}>
          <Box
            borderRadius="4px"
            component="form"
            height="32px"
            marginBottom="4px"
            sx={{
              backgroundColor: 'var(--mui-palette-action-disabledBackground)',
            }}
            onSubmit={handleSubmit}
          >
            <InputBase
              fullWidth
              endAdornment={(
                <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={handleSubmit}>
                  <SvgIcon sx={{
                    mr: '12px',
                    color: 'text.secondary',
                    height: '18px',
                    width: '18px',
                    transform: 'rotate(45deg)',
                  }}
                  >
                    <RiSendPlaneLine />
                  </SvgIcon>
                </InputAdornment>
              )}
              inputProps={{ style: { padding: '4px 8px 4px' }, spellCheck: false }}
              placeholder="Save as playlist..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>
        </Collapse>
        <AddFilter
          error={error}
          filters={filters}
          setError={setError}
          setFilters={setFilters}
        />
        <Box
          className="scroll-container"
          // eslint-disable-next-line max-len
          height={(panelRef.current?.clientHeight || 600) - (338 + (show ? 36 : 0) + (error ? 22 : 0))}
          overflow="auto"
          sx={{
            transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          }}
          width={1}
        >
          {filters.length > 0 && filters.map((filter, index, array) => (
            <Chip
              deleteIcon={(
                <FaTimes />
              )}
              key={filter.hash}
              label={(
                <Box
                  alignItems="center"
                  display="inline-flex"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Typography component="span" display="inline" fontSize="0.8125rem">
                    {`${filter.group} ${filter.label.toLowerCase()}`}
                  </Typography>
                  <Typography
                    component="span"
                    display="inline"
                    fontSize="0.8125rem"
                    sx={{ color: 'text.secondary' }}
                  >
                    &nbsp;
                    {`${filter.operator}`}
                    &nbsp;
                  </Typography>
                  {filter.field === 'userRating' && filter.value === -1 && (
                    <Typography component="span" display="inline" fontSize="0.8125rem">
                      unrated
                    </Typography>
                  )}
                  {filter.field === 'userRating' && filter.value !== -1 && (
                    <Rating value={filter.value as number} />
                  )}
                  {filter.field !== 'userRating' && (
                    <Typography
                      component="span"
                      display="inline"
                      fontSize="0.8125rem"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {`${filter.display?.toString().toLowerCase()}`}
                    </Typography>
                  )}
                </Box>
              )}
              size="small"
              sx={{
                borderRadius: '4px',
                justifyContent: 'space-between',
                marginBottom: index === array.length - 1 ? 0 : '4px',
                width: '100%',
                '& .MuiChip-deleteIcon': {
                  color: 'text.secondary',
                  marginRight: '4px',
                  '&:hover': {
                    color: 'error.main',
                  },
                },
                '& .MuiChip-label': {
                  alignItems: 'center',
                  display: 'flex',
                },
              }}
              onDelete={() => handleRemoveFilter(filter.hash)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FilterPanel;
