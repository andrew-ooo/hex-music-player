import { AlertColor, PaletteMode } from '@mui/material';
import { Account, Artist, Device, Library } from 'hex-plex';
import React from 'react';

export interface AppState {
  account: Account;
  server: Device;
  library: Library;
}

export interface AppInfo {
  appName: string;
  appVersion: string;
  hostname: string;
  platform: string;
  version: string;
}

export interface AppSettings {
  colorMode?: PaletteMode;
  compactNav?: boolean;
  compactQueue?: boolean,
  dockedQueue?: boolean;
}

export interface Config {
  clientId?: string;
  queueId?: number;
  sectionId?: number;
  serverName?: string;
  token?: string;
}

export interface DiscHeader {
  _type: 'discHeader';
  value: string;
}

export interface Filter {
  artist: Artist['guid'];
  exclusions: Artist['guid'][];
}

export interface IElectronAPI {
  maximize: () => void;
  minimize: () => void;
  quit: () => void;
  unmaximize: () => void;
  getAppInfo: () => AppInfo;
  readConfig: (key: string) => AppSettings | Config;
  writeConfig: (key: string, value: any) => AppSettings | Config;
  readFilters: (key: string) => Filter[];
  writeFilters: (key: string, value: any) => Filter[];
}

export interface PlayerState {
  duration?: number;
  isPlaying?: boolean;
  position?: number;
}

export interface RouteParams {
  id: string;
}

export interface ToastMessage {
  type: AlertColor | undefined;
  text: string;
}

export interface TrackContainerContextState {
  handleRowClick: (index: number) => void;
  scrollSpeed: React.MutableRefObject<number>
  selectedRows: number[];
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>;
}

export interface TrackRowOptions {
  showAlbum: boolean;
  showArt: boolean;
  showTrackNumber: boolean;
}
