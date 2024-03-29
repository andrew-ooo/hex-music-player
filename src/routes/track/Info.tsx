import { Box, Divider, Grid, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { Album, Track } from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import { LastFmTrack } from 'types/lastfm-interfaces';

const dividerStyle = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '100%',
};

interface InfoCardProps {
  children: React.ReactNode;
  lg: number;
  md: number;
}

const InfoCard = ({ children, ...props }: InfoCardProps) => (
  <Grid
    item
    marginBottom="20px"
    {...props}
  >
    <Box
      sx={{
        borderRadius: '4px',
        height: '100%',
        marginBottom: '6px',
        paddingTop: '12px',
        paddingX: '16px',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </Box>
  </Grid>
);

interface InfoRowProps {
  data: string | number;
  title: string;
}

const InfoRow = ({ data, title }: InfoRowProps) => (
  <>
    <Typography color="text.secondary" variant="subtitle2">{title}</Typography>
    <Typography bottom="4px" position="relative">
      {data}
    </Typography>
  </>
);

interface InfoProps {
  album: Album;
  lastfmTrack: LastFmTrack | undefined;
  track: Track;
}

const Info = ({ album, lastfmTrack, track }: InfoProps) => {
  const { getFormattedTime } = useFormattedTime();
  return (
    <Box>
      <Typography
        color="text.primary"
        fontFamily="TT Commons, sans-serif"
        fontSize="1.625rem"
      >
        Track Information
      </Typography>
      <Grid
        container
        color="text.primary"
        columnSpacing={1}
        marginBottom="12px"
      >
        <InfoCard lg={4} md={12}>
          <InfoRow
            data={track.originalTitle ? track.originalTitle : track.grandparentTitle}
            title="Artist"
          />
          <InfoRow data={track.parentTitle} title="Album" />
          <InfoRow data={getFormattedTime(track.duration)} title="Duration" />
          <InfoRow data={track.trackNumber} title="Tracknumber" />
          <InfoRow data={track.parentStudio ? track.parentStudio : '—'} title="Record Label" />
          <Divider
            orientation={window.innerWidth < 1200 ? 'horizontal' : 'vertical'}
            sx={dividerStyle}
          />
        </InfoCard>
        <InfoCard lg={4} md={12}>
          <InfoRow data={track.viewCount > 0 ? track.viewCount : '—'} title="Playcount" />
          <InfoRow
            data={lastfmTrack?.listeners
              ? parseInt(lastfmTrack.listeners, 10).toLocaleString()
              : '—'}
            title="Last.fm Listeners"
          />
          <InfoRow
            data={lastfmTrack?.playcount
              ? parseInt(lastfmTrack.playcount, 10).toLocaleString()
              : '—'}
            title="Last.fm Scrobbles"
          />
          <Divider
            orientation={window.innerWidth < 1200 ? 'horizontal' : 'vertical'}
            sx={dividerStyle}
          />
        </InfoCard>
        <InfoCard lg={4} md={12}>
          <InfoRow
            data={moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY')}
            title="Release Date"
          />
          <InfoRow
            data={moment(track.addedAt).format('DD MMMM YYYY')}
            title="Date Added"
          />
          <InfoRow
            data={track.lastViewedAt ? moment(track.lastViewedAt).format('DD MMMM YYYY') : '—'}
            title="Last Played"
          />
          <InfoRow
            data={track.updatedAt ? moment(track.updatedAt).format('DD MMMM YYYY') : '—'}
            title="Updated At"
          />
        </InfoCard>
      </Grid>
    </Box>
  );
};

export default Info;
