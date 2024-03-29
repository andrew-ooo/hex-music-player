import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { CgSearch } from 'react-icons/cg';

const FixedHeader = ({ query }: { query: string }) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="1588px"
    paddingX="6px"
    width="calc(100% - 12px)"
  >
    <Avatar
      alt="Search"
      sx={{
        background: `linear-gradient(
          to bottom right,
          var(--mui-palette-primary-main),
          rgba(var(--mui-palette-primary-mainChannel) / 0.60))`,
        width: 60,
        height: 60,
      }}
      variant="rounded"
    >
      <SvgIcon sx={{ height: 40, width: 40 }} viewBox="1 -1 24 24">
        <CgSearch />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      {`Search results for "${query}"`}
    </Typography>
  </Box>
);

export default FixedHeader;
