import {
  SvgIcon, Tooltip, useTheme, Zoom,
} from '@mui/material';
import React from 'react';
import { MdKeyboardArrowRight } from 'react-icons/all';
import TooltipMenu from './TooltipMenu';
import type { Result } from 'types/types';

interface Props {
  result: Result;
  isTooltipOpen: boolean;
  setTooltipOpen: React.Dispatch<React.SetStateAction<boolean>>;
  color: 'text.primary' | 'common.black'
}

const ResultTooltip = ({
  result, isTooltipOpen, setTooltipOpen, color,
}: Props) => {
  const theme = useTheme();

  return (
    <Tooltip
      arrow
      TransitionComponent={Zoom}
      componentsProps={{
        tooltip: {
          sx: {
            width: '152px',
            left: '-4px',
            padding: '5px 5px',
            background: theme.palette.background.paper,
            border: 'solid 1px',
            borderColor: 'border.main',
            '& .MuiTooltip-arrow': {
              '&::before': {
                background: theme.palette.background.paper,
                border: 'solid 1px',
                borderColor: 'border.main',
              },
            },
          },
        },
      }}
      enterDelay={300}
      enterNextDelay={300}
      open={isTooltipOpen}
      placement="right"
      sx={{ pointerEvents: 'auto' }}
      title={(
        <TooltipMenu
          open={isTooltipOpen}
          result={result}
          setOpen={setTooltipOpen}
        />
      )}
      onClose={() => {
        setTooltipOpen(false);
        document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
      }}
      onOpen={() => {
        setTooltipOpen(true);
        document.querySelector('.titlebar')?.classList.add('titlebar-nodrag');
      }}
    >
      <SvgIcon sx={{ color, height: '48px' }}>
        <MdKeyboardArrowRight />
      </SvgIcon>
    </Tooltip>
  );
};

export default ResultTooltip;
