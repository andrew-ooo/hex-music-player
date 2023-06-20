import React, { useEffect, useMemo } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ListProps } from 'react-virtuoso';
import { TrackMenu } from 'components/menus';
import useRowSelection from 'hooks/useRowSelection';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import useTrackMenu from 'hooks/useTrackMenu';
import ListBox from 'routes/virtuoso-components/ListBox';
import { DragTypes } from 'types/enums';
import { ChartsContext } from './Charts';

const List = React
  .forwardRef((
    { style, children, context }: ListProps & { context?: ChartsContext | undefined },
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const { hoverIndex, topTracks } = context!;
    const { getAllSelections, clearRowSelection } = useRowSelection();
    const selections = useMemo(() => getAllSelections(), [getAllSelections]);

    const { drag, dragPreview } = useTrackDragDrop({
      hoverIndex,
      items: topTracks || [],
      selectedRows: selections,
      type: DragTypes.TRACK,
    });

    useEffect(() => {
      dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [dragPreview, selections]);

    const {
      anchorPoint,
      handleContextMenu,
      menuProps,
      playSwitch,
      selectedTracks,
      toggleMenu,
    } = useTrackMenu({ tracks: context?.topTracks || [] });

    return (
      <>
        <ListBox
          clearRowSelection={clearRowSelection}
          drag={drag}
          handleContextMenu={handleContextMenu}
          hoverIndex={hoverIndex}
          listRef={listRef}
          selectedRows={selections}
          style={style}
        >
          {children}
        </ListBox>
        <TrackMenu
          anchorPoint={anchorPoint}
          playSwitch={playSwitch}
          toggleMenu={toggleMenu}
          tracks={selectedTracks}
          {...menuProps}
        />
      </>
    );
  });

List.defaultProps = {
  context: undefined,
};

export default List;
