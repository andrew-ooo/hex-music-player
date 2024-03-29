import { useMenuState } from '@szhsin/react-menu';
import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import { Album, Artist, Hub, Library, Track } from 'api/index';
import { plexSort } from 'classes';
import { ArtistMenu } from 'components/menus';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useArtist, useArtistTracks } from 'queries/artist-queries';
import { configAtom, libraryAtom } from 'root/Root';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { PlayActions, SortOrders, TrackSortKeys } from 'types/enums';
import { CardMeasurements, RouteParams } from 'types/interfaces';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';

interface LocationWithState extends Location {
  state: { guid: Artist['guid'], title: Artist['title'] }
}

type OpenArtist = Pick<Artist, 'id' | 'guid' | 'title'>;

export interface SimilarArtistGroup {
  _type: string;
  identifier: string;
  text: string;
}

export interface SimilarArtistRow {
  _type: string;
  artists: Artist[];
  grid: { cols: number };
  section: string;
}

export interface SimilarArtistItems {
  rows?: SimilarArtistRow[];
  groups?: SimilarArtistGroup[];
  groupCounts?: number[];
}

export interface SimilarArtistContext {
  artist: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  items: SimilarArtistItems;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Artist[];
  navigate: NavigateFunction;
  open: boolean;
  openArtist: Pick<Artist, 'id' | 'guid' | 'title'>;
  openArtistQuery: UseQueryResult<{albums: Album[], artist: Artist, hubs: Hub[]}>,
  openArtistTracksQuery: UseQueryResult<Track[]>;
  openCard: {row: number, index: number};
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenArtist: React.Dispatch<React.SetStateAction<OpenArtist>>;
  setOpenCard: React.Dispatch<React.SetStateAction<{row: number, index: number}>>;
  thumbSrc: string;
  virtuoso: React.RefObject<GroupedVirtuosoHandle>;
  width: number;
}

export interface RowProps {
  index: number;
  context: SimilarArtistContext;
}

const RowContent = (props: RowProps) => <Row {...props} />;
const GroupRowContent = (props: RowProps) => <GroupRow {...props} />;

const SimilarArtists = () => {
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id, library);

  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const queryClient = useQueryClient();
  const topMostGroup = useRef<SimilarArtistGroup | null>(null);
  const virtuoso = useRef<GroupedVirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const [open, setOpen] = useState(false);
  const [openArtist, setOpenArtist] = useState<OpenArtist>({ id: -1, title: '', guid: '' });
  const [openCard, setOpenCard] = useState({ row: -1, index: -1 });
  const { playSwitch } = usePlayback();
  const { width } = useOutletContext() as { width: number };

  const openArtistQuery = useArtist(openArtist.id, library);
  const openArtistTracksQuery = useArtistTracks({
    config,
    library,
    id: openArtist.id,
    title: openArtist.title,
    guid: openArtist.guid,
    sort: plexSort(TrackSortKeys.PLAYCOUNT, SortOrders.DESC),
    slice: 5,
  });

  const thumbSrc = library.api
    .getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: artist.data?.artist.thumb || 'null', width: 100, height: 100 },
    );

  // create array for virtualization
  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const items = useMemo(() => {
    if (!artist.data) {
      return {};
    }
    const rows: SimilarArtistRow[] = [];
    const groups: SimilarArtistGroup[] = [];
    const groupCounts: number[] = [];
    const similar = artist.data?.hubs.find((hub) => hub.hubIdentifier === 'artist.similar');
    let sonicSimilar = artist.data?.hubs
      .find((hub) => hub.hubIdentifier === 'external.artist.similar.sonically');
    let sonicFiltered;
    if (similar && similar.items.length > 0) {
      sonicFiltered = sonicSimilar?.items
        .filter((sonicArtist) => similar?.items
          .every((similarArtist) => similarArtist.id !== sonicArtist.id));
    } else {
      sonicFiltered = sonicSimilar?.items;
    }
    if (similar && similar.items.length > 0 && sonicSimilar && sonicFiltered) {
      sonicSimilar = { ...sonicSimilar, items: sonicFiltered || [] };
    }
    if (similar && similar.size > 0) {
      let count = 0;
      const identifier = similar.hubIdentifier;
      groups.push({ _type: 'subheaderText', identifier, text: similar.title });
      for (let i = 0; i < similar.items.length; i += grid.cols) {
        const row = similar.items.slice(i, i + grid.cols) as Artist[];
        rows.push({
          _type: 'artists', artists: row, grid, section: similar.title,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    if (sonicSimilar && sonicFiltered && sonicFiltered?.length > 0) {
      let count = 0;
      const identifier = sonicSimilar.hubIdentifier;
      groups.push({ _type: 'subheaderText', identifier, text: sonicSimilar.title });
      for (let i = 0; i < sonicSimilar.items.length; i += grid.cols) {
        const row = sonicSimilar.items.slice(i, i + grid.cols) as Artist[];
        rows.push({
          _type: 'artists', artists: row, grid, section: sonicSimilar.title,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    return { rows, groups, groupCounts };
  }, [artist.data, grid]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!items.rows) return;
    const artists = items.rows.map((row) => row.artists).flat();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(artists
      .filter((el) => el.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [items, toggleMenu]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`similar-artists-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `similar-artists-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_HEIGHT: Math.floor(((width - VIEW_PADDING) / grid.cols) * 0.70) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid, width]);

  const similarArtistContext = useMemo(() => ({
    artist: artist.data,
    grid,
    handleContextMenu,
    items,
    library,
    measurements,
    menuTarget,
    navigate,
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    playSwitch,
    setOpen,
    setOpenArtist,
    setOpenCard,
    thumbSrc,
    virtuoso,
    width,
  }), [
    artist.data,
    grid,
    handleContextMenu,
    items,
    library,
    measurements,
    menuTarget,
    navigate,
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    playSwitch,
    setOpen,
    setOpenArtist,
    setOpenCard,
    thumbSrc,
    virtuoso,
    width,
  ]);

  if (!artist.data) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key={location.pathname}
        style={{ height: '100%' }}
        onAnimationComplete={() => virtuoso.current
          ?.scrollTo({ top: initialScrollTop })}
      >
        <GroupedVirtuoso
          className="scroll-container"
          components={{
            Footer: FooterWide,
            Header,
          }}
          context={similarArtistContext}
          groupContent={(index) => GroupRowContent(
            { index, context: similarArtistContext },
          )}
          groupCounts={items.groupCounts}
          isScrolling={handleScrollState}
          itemContent={
            (index, _groupIndex, _item, context) => RowContent({ index, context })
          }
          itemsRendered={(list) => {
            // @ts-ignore
            const renderedGroupIndices = (list).map((listEl) => listEl.groupIndex);
            if (topMostGroup.current !== items.groups![renderedGroupIndices[0]]) {
              queryClient.setQueryData(
                ['similar-header-text'],
                items.groups![renderedGroupIndices[0]]?.text,
              );
              topMostGroup.current = items.groups![renderedGroupIndices[0]];
            }
          }}
          ref={virtuoso}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              `similar-artists-scroll ${id}`,
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <ArtistMenu
        anchorPoint={anchorPoint}
        artists={menuTarget}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </>
  );
};

export default SimilarArtists;
