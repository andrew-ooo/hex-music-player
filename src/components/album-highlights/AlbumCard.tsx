import { SvgIcon } from '@mui/material';
import { Album, Library } from 'hex-plex';
import React from 'react';
import { RiAlbumFill } from 'react-icons/all';
import { Link, NavigateFunction } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';

export interface Measurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

interface AlbumCardProps {
  album: Album;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: Measurements;
  menuTarget: Album[];
  navigate: NavigateFunction;
}

const AlbumCard = ({
  album, handleContextMenu, library, measurements, menuTarget, navigate,
}: AlbumCardProps) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(album.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  return (
    <MotionBox
      className={styles.container}
      data-id={album.id}
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
        variants={imageMotion}
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
      </Subtitle>
    </MotionBox>
  );
};

export default AlbumCard;