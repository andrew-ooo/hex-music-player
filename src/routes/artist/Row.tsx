import { Box } from '@mui/material';
import React from 'react';
import AlbumCard from 'components/album/AlbumCard';
import AlbumCardNoText from 'components/album/AlbumCardNoText';
import { RowProps } from './Artist';

const Row = React.memo(({ albums, context }: RowProps) => {
  const {
    handleContextMenu, library, measurements, menuTarget, navigate, settings, sort,
  } = context;
  return (
    <Box
      display="flex"
      gap="8px"
      height={settings.albumText ? measurements.ROW_HEIGHT + 8 : measurements.ROW_HEIGHT}
      mx="auto"
      width={measurements.ROW_WIDTH}
    >
      {settings.albumText && albums.map((album) => (
        <AlbumCard
          album={album}
          handleContextMenu={handleContextMenu}
          key={album.id}
          library={library}
          measurements={measurements}
          menuTarget={menuTarget}
          metaText={sort.by}
          navigate={navigate}
          section={album.section}
          showArtistTitle={album.section === 'Appears On'}
        />
      ))}
      {!settings.albumText && albums.map((album) => (
        <AlbumCardNoText
          album={album}
          handleContextMenu={handleContextMenu}
          key={album.id}
          library={library}
          measurements={measurements}
          menuTarget={menuTarget}
          navigate={navigate}
          section={album.section}
          showArtistTitle={album.section === 'Appears On'}
        />
      ))}
    </Box>
  );
});

export default Row;
