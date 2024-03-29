import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  MenuItem,
  Paper,
  SelectChangeEvent,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAtom } from 'jotai';
import { useCallback, useRef } from 'react';
import { BiPaste } from 'react-icons/bi';
import { TbExternalLink } from 'react-icons/tb';
import { useOutletContext } from 'react-router-dom';
import { HexSort } from 'classes';
import Select from 'components/select/Select';
import { WIDTH_CALC } from 'constants/measures';
import { settingsAtom } from 'root/Root';
import { AlbumWithSection, AppSettings } from 'types/interfaces';
import ColorPicker from './ColorPicker';

const boxStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 0.5,
};

const Settings = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useAtom(settingsAtom);
  const { height } = useOutletContext() as { height: number };
  const updateConfig = useCallback((key: keyof AppSettings, value: any) => {
    const newSettings = structuredClone(settings);
    newSettings[key] = value;
    setSettings(newSettings);
  }, [settings, setSettings]);

  const handleDarkModeOption = async () => {
    await updateConfig('colorMode', (settings.colorMode === 'light' ? 'dark' : 'light'));
  };

  const handleQueueDrawerOption = async () => {
    await updateConfig('dockedQueue', !settings.dockedQueue);
  };

  const handleMiniQueueOption = async () => {
    await updateConfig('compactQueue', !settings.compactQueue);
  };

  const handleCompactNavOption = async () => {
    await updateConfig('compactNav', !settings.compactNav);
  };

  const handleAlbumTextOption = async () => {
    await updateConfig('albumText', !settings.albumText);
  };

  const handleAlbumSortOption = async (e: SelectChangeEvent<unknown>) => {
    if (!settings.albumSort) return;
    const value = e.target.value as keyof AlbumWithSection;
    const newSort = HexSort.parse(settings.albumSort).setBy(value).stringify();
    await updateConfig('albumSort', newSort);
  };

  const handleAlbumOrderOption = async (e: SelectChangeEvent<unknown>) => {
    if (!settings.albumSort) return;
    const value = e.target.value as 'asc' | 'desc';
    const newSort = HexSort.parse(settings.albumSort).setOrder(value).stringify();
    await updateConfig('albumSort', newSort);
  };

  const pasteText = async () => {
    const text = await navigator.clipboard.readText();
    if (text.length === 32 && !!inputRef.current) {
      inputRef.current.value = text;
      await updateConfig('apiKey', text);
    }
  };

  return (
    <Box
      className="scroll-container"
      height={height}
      overflow="auto"
      width={1}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          margin: 'auto',
          maxWidth: '600px',
          pt: 2,
          width: WIDTH_CALC,
        }}
      >
        <Typography variant="h1">Settings</Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">App Interface</Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Accent Color</Typography>
          <Tooltip
            arrow
            placement="right"
            title={(
              <ColorPicker primaryColor={settings.primaryColor!} updateConfig={updateConfig} />
            )}
          >
            <Box
              bgcolor={settings.primaryColor}
              borderRadius="4px"
              height={38}
              mr="2px"
              width={38}
            />
          </Tooltip>
        </Box>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Dark Mode</Typography>
          <Switch
            checked={settings.colorMode === 'dark'}
            onChange={handleDarkModeOption}
          />
        </Box>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Docked Queue</Typography>
          <Switch
            checked={settings.dockedQueue}
            disabled={settings.compactQueue}
            onChange={handleQueueDrawerOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Keep the queue displayed on the right side of the window
        </Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Queue</Typography>
          <Switch
            checked={settings.compactQueue}
            disabled={settings.dockedQueue}
            onChange={handleMiniQueueOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Use a smaller version of the queue toolbar
        </Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Navigation</Typography>
          <Switch
            checked={settings.compactNav}
            onChange={handleCompactNavOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Use a smaller version of the navigation sidebar
        </Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">Artist Page</Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Album Grid Text</Typography>
          <Switch
            checked={settings.albumText}
            // sx={switchStyle}
            onChange={handleAlbumTextOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Always show album title in album grid views
        </Typography>
        <Box sx={{ ...boxStyle, height: 38 }}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Sorting</Typography>
          <Typography sx={{ ml: 'auto' }} variant="subtitle2">
            by:&nbsp;
          </Typography>
          <Select
            value={HexSort.parse(settings.albumSort!).by}
            onChange={handleAlbumSortOption}
          >
            <MenuItem value="addedAt">Date Added</MenuItem>
            <MenuItem value="lastViewedAt">Last Played</MenuItem>
            <MenuItem value="viewCount">Playcount</MenuItem>
            <MenuItem value="originallyAvailableAt">Release Date</MenuItem>
            <MenuItem value="section">Release Type</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
          <Typography sx={{ ml: '8px' }} variant="subtitle2">
            order:&nbsp;
          </Typography>
          <Select
            value={HexSort.parse(settings.albumSort!).order}
            onChange={handleAlbumOrderOption}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </Box>
        <Typography mt={-0.5} variant="subtitle2">
          Default album sort order
        </Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">Last.fm Integration</Typography>
        <Box sx={{ ...boxStyle, height: '38px' }}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">API Key</Typography>
          <Input
            disabled
            endAdornment={(
              <InputAdornment position="end">
                <IconButton
                  disableRipple
                  edge="end"
                  onClick={pasteText}
                >
                  <SvgIcon>
                    <BiPaste />
                  </SvgIcon>
                </IconButton>
              </InputAdornment>
            )}
            inputProps={{
              style: {
                width: '32ch',
              },
            }}
            inputRef={inputRef}
            value={settings.apiKey || ''}
          />
        </Box>
        <Typography mt={-0.5} variant="subtitle2">
          {'Paste your '}
          <a
            href="https://www.last.fm/api/authentication"
            rel="noreferrer"
            style={{
              color: 'inherit',
            }}
            target="_blank"
          >
            last.fm API key
          </a>
          &nbsp;
          <TbExternalLink viewBox="0 -1 22 22" />
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;
