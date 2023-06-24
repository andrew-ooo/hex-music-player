import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Collapse,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import hash from 'object-hash';
import { useEffect, useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { FaTimes } from 'react-icons/fa';
import { QueryKeys } from 'types/enums';
import FilterAutocomplete from './FilterAutocomplete';
import filterInputs, { FilterTypes, Operators } from './filterInputs';
import FilterRating, { Rating } from './FilterRating';
import FilterText from './FilterText';
import SortSelect from './SortSelect';

const ExpandIcon = () => (
  <SvgIcon>
    <BiChevronDown />
  </SvgIcon>
);

export interface FilterObject {
  type: FilterTypes;
  group: 'Artist' | 'Album' | 'Track';
  field: string;
  label: string;
  operator: Operators;
  value: string | number | undefined;
  display: string | number | undefined;
  hash: string;
}

const Filter = ({ pathname }: { pathname: string }) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState('panel-0');
  const [filters, setFilters] = useState<FilterObject[]>([]);
  const [openInput, setOpenInput] = useState({ grp: -1, idx: -1 });

  useEffect(() => {
    queryClient.setQueryData([QueryKeys.FILTERS], filters);
  }, [filters, queryClient]);

  const handleAccordianChange = (panel: string) => {
    if (expanded === panel) {
      setExpanded('panel-0');
      return;
    }
    setExpanded(panel);
  };

  const handleAddFilter = ({
    type, group, field, label, operator, value, display,
  } : Omit<FilterObject, 'hash'>) => {
    if (!value) return;
    const newFilter = {
      type,
      group,
      field,
      label,
      operator,
      value,
      display,
    } as FilterObject;
    const filterHash = hash.sha1(newFilter);
    newFilter.hash = filterHash;
    if (filters.some((currentFilter) => currentFilter.hash === filterHash)) return;
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
  };

  const handleInputCollapse = (grp: number, idx: number) => {
    if (grp === openInput.grp && idx === openInput.idx) {
      setOpenInput(({ grp: -1, idx: -1 }));
      return;
    }
    setOpenInput(({ grp, idx }));
  };

  const handleRemoveFilter = (filterHash: string) => {
    const newFilters = filters.filter((filter) => filter.hash !== filterHash);
    setFilters(newFilters);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={1}
      marginBottom="4px"
      marginLeft="4px"
      overflow="hidden"
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
      <Box width={1}>
        {filters.length > 0 && filters.map((filter) => (
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
                  <Typography component="span" display="inline" fontSize="0.8125rem">
                    {`${filter.display?.toString().toLowerCase()}`}
                  </Typography>
                )}
              </Box>
            )}
            size="small"
            sx={{
              borderRadius: '4px',
              marginBottom: '4px',
              marginRight: '4px',
              maxWidth: 'calc(100% - 10px)',
              width: 'fit-content',
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
      <Box alignItems="center" display="flex" ml="6px" mr="14px">
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
      <Box
        className="scroll-container"
        display="flex"
        flexDirection="column"
        height="-webkit-fill-available"
        overflow="auto"
        sx={{
          scrollbarGutter: 'stable',
        }}
      >
        <Accordion
          disableGutters
          elevation={1}
          expanded={expanded === 'panel-1'}
          sx={{
            border: '1px solid',
            borderColor: 'transparent',
            borderRadius: '4px !important',
            '&:before': {
              display: 'none',
            },
          }}
          onChange={() => handleAccordianChange('panel-1')}
        >
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            sx={{
              minHeight: 40,
              padding: '0 8px',
              '& > .MuiAccordionSummary-content': {
                margin: '4px 0',
                '& .MuiTypography-root': {
                  fontWeight: '700',
                },
              },
            }}
          >
            <Typography>Artist</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: 1,
              paddingTop: 0,
            }}
          >
            {filterInputs
              .filter((input) => input.groups.includes('Artist'))
              .map((input, index) => (
                <Collapse
                  collapsedSize={32}
                  in={openInput.grp === 1 && openInput.idx === index}
                  key={input.field}
                  onClick={() => handleInputCollapse(1, index)}
                >
                  <Typography
                    lineHeight={2}
                    sx={{
                      cursor: 'pointer',
                      color: openInput.grp === 1 && openInput.idx === index
                        ? 'text.primary'
                        : 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    {input.label}
                  </Typography>
                  {input.field === 'userRating' && (
                    <FilterRating
                      group="Artist"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {input.options && input.field !== 'userRating' && (
                    <FilterAutocomplete
                      group="Artist"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {!input.options && (
                    <FilterText
                      group="Artist"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                </Collapse>
              ))}
          </AccordionDetails>
        </Accordion>
        <Box flexShrink={0} height={4} />
        <Accordion
          disableGutters
          elevation={1}
          expanded={expanded === 'panel-2'}
          sx={{
            border: '1px solid',
            borderColor: 'transparent',
            borderRadius: '4px !important',
            '&:before': {
              display: 'none',
            },
          }}
          onChange={() => handleAccordianChange('panel-2')}
        >
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            sx={{
              minHeight: 40,
              padding: '0 8px',
              '& > .MuiAccordionSummary-content': {
                margin: '4px 0',
                '& .MuiTypography-root': {
                  fontWeight: '700',
                },
              },
            }}
          >
            <Typography>Album</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: 1,
              paddingTop: 0,
            }}
          >
            {filterInputs
              .filter((input) => input.groups.includes('Album'))
              .map((input, index) => (
                <Collapse
                  collapsedSize={32}
                  in={openInput.grp === 2 && openInput.idx === index}
                  key={input.field}
                  onClick={() => handleInputCollapse(2, index)}
                >
                  <Typography
                    lineHeight={2}
                    sx={{
                      cursor: 'pointer',
                      color: openInput.grp === 2 && openInput.idx === index
                        ? 'text.primary'
                        : 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    {input.label}
                  </Typography>
                  {input.field === 'userRating' && (
                    <FilterRating
                      group="Album"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {input.options && input.field !== 'userRating' && (
                    <FilterAutocomplete
                      group="Album"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {!input.options && (
                    <FilterText
                      group="Album"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                </Collapse>
              ))}
          </AccordionDetails>
        </Accordion>
        <Box flexShrink={0} height={4} />
        <Accordion
          disableGutters
          elevation={1}
          expanded={expanded === 'panel-3'}
          sx={{
            border: '1px solid',
            borderColor: 'transparent',
            borderRadius: '4px !important',
            '&:before': {
              display: 'none',
            },
          }}
          onChange={() => handleAccordianChange('panel-3')}
        >
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            sx={{
              minHeight: 40,
              padding: '0 8px',
              '& > .MuiAccordionSummary-content': {
                margin: '4px 0',
                '& .MuiTypography-root': {
                  fontWeight: '700',
                },
              },
            }}
          >
            <Typography>Track</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: 1,
              paddingTop: 0,
            }}
          >
            {filterInputs
              .filter((input) => input.groups.includes('Track'))
              .map((input, index) => (
                <Collapse
                  collapsedSize={32}
                  in={openInput.grp === 3 && openInput.idx === index}
                  key={input.field}
                  onClick={() => handleInputCollapse(3, index)}
                >
                  <Typography
                    lineHeight={2}
                    sx={{
                      cursor: 'pointer',
                      color: openInput.grp === 3 && openInput.idx === index
                        ? 'text.primary'
                        : 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                      },
                    }}
                  >
                    {input.label}
                  </Typography>
                  {input.field === 'userRating' && (
                    <FilterRating
                      group="Track"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {input.options && input.field !== 'userRating' && (
                    <FilterAutocomplete
                      group="Track"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                  {!input.options && (
                    <FilterText
                      group="Track"
                      handleAddFilter={handleAddFilter}
                      input={input}
                    />
                  )}
                </Collapse>
              ))}
          </AccordionDetails>
        </Accordion>
        <Box flexShrink={0} height={4} />
      </Box>
    </Box>
  );
};

export default Filter;
