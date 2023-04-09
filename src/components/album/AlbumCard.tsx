import { SvgIcon } from '@mui/material';
import moment from 'moment';
import React, { useState } from 'react';
import { RiAlbumFill } from 'react-icons/all';
import { Link, NavigateFunction } from 'react-router-dom';
import { Album, Library } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import usePlayback from 'hooks/usePlayback';
import styles from 'styles/MotionImage.module.scss';
import { CardMeasurements, Sort } from 'types/interfaces';

interface Map {
  [key: string]: string;
}

const typeMap: Map = {
  Albums: 'Album',
  'Singles & EPs': 'Single / EP',
  Soundtracks: 'Soundtrack',
  Compilations: 'Compilation',
  'Live Albums': 'Live Album',
  Demos: 'Demo',
  Remixes: 'Remix',
  'Appears On': 'Guest Appearance',
};

const getAdditionalText = (album: Album, section: string, by: string) => {
  if (by === 'added') {
    return moment(album.addedAt).fromNow();
  }
  if (by === 'date') {
    return moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');
  }
  if (by === 'played') {
    if (!album.lastViewedAt) return 'unplayed';
    return moment(album.lastViewedAt).fromNow();
  }
  if (by === 'plays') {
    return (album.viewCount
      ? `${album.viewCount} ${album.viewCount > 1 ? 'plays' : 'play'}`
      : 'unplayed');
  }
  if (by === 'title') {
    // @ts-ignore
    const text = typeMap[section];
    return text.toLowerCase();
  }
  if (by === 'type') {
    // @ts-ignore
    const text = typeMap[section];
    return text.toLowerCase();
  }
  return '';
};

interface AlbumCardProps {
  album: Album;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Album[];
  navigate: NavigateFunction;
  section?: string;
  sort?: Sort;
}

const AlbumCard = ({
  album,
  handleContextMenu,
  library,
  measurements,
  menuTarget,
  navigate,
  section,
  sort,
}: AlbumCardProps) => {
  const [hover, setHover] = useState(false);
  const { playAlbum } = usePlayback();

  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(album.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  const handlePlay = () => playAlbum(album);
  const handleShuffle = () => playAlbum(album, true);

  return (
    <MotionBox
      className={styles.container}
      data-id={album.id}
      data-section={section}
      height={measurements.ROW_HEIGHT}
      key={album.id}
      sx={{
        backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        borderRadius: '4px',
        contain: 'paint',
        '&:hover': {
          backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        },
      }}
      whileHover="hover"
      width={measurements.IMAGE_SIZE}
      onClick={() => navigate(`/albums/${album.id}`)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_SIZE - 24}
        margin="12px"
        style={{
          borderRadius: '4px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={menuOpen ? {} : imageMotion}
        width={measurements.IMAGE_SIZE - 24}
      >
        {!album.thumb && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <RiAlbumFill />
          </SvgIcon>
        )}
      </MotionBox>
      <Title
        marginX="12px"
      >
        {album.title}
      </Title>
      <Subtitle
        marginX="12px"
      >
        {!sort && (
          <Link
            className="link"
            state={{
              guid: album.parentGuid,
              title: album.parentTitle,
            }}
            to={`/artists/${album.parentId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {album.parentTitle}
          </Link>
        )}
        {!!sort && !!section && (
          <>
            {getAdditionalText(album, section, sort.by)}
          </>
        )}
      </Subtitle>
      {hover && (
        <MotionBox
          animate={{ opacity: 1, y: 0 }}
          bottom={6}
          initial={{ opacity: 0, y: 10 }}
          position="absolute"
          right={6}
        >
          <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
        </MotionBox>
      )}
    </MotionBox>
  );
};

AlbumCard.defaultProps = {
  section: 'Albums',
  sort: undefined,
};

export default AlbumCard;
