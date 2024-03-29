import { useQueryClient } from '@tanstack/react-query';
import { Album, Artist } from 'api/index';
import { QueryKeys } from 'types/enums';

const useHideAlbum = () => {
  const queryClient = useQueryClient();
  return async (artist: Artist, album: Album) => {
    const filters = window.electron.readFilters('filters');
    if (!filters) {
      window.electron.writeFilters('filters', [{ artist: artist.guid, exclusions: [album.guid] }]);
      await queryClient.refetchQueries([QueryKeys.ARTIST_APPEARANCES, artist.id]);
      await queryClient.refetchQueries([QueryKeys.ARTIST_TRACKS, artist.id]);
      return;
    }
    const index = filters.findIndex((obj) => obj.artist === artist.guid);
    if (index > -1) {
      const newExclusions = [...filters[index].exclusions, album.guid];
      filters[index] = { artist: artist.guid, exclusions: newExclusions };
    }
    if (index === -1) {
      filters.push({ artist: artist.guid, exclusions: [album.guid] });
    }
    window.electron.writeFilters('filters', filters);
    await queryClient.refetchQueries([QueryKeys.ARTIST_APPEARANCES, artist.id]);
    await queryClient.refetchQueries([QueryKeys.ARTIST_TRACKS, artist.id]);
  };
};

export default useHideAlbum;
