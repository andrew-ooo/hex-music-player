import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import useQueue from 'hooks/useQueue';
import { accountAtom, libraryAtom, queueIdAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';

export const useCurrentQueue = () => {
  const library = useAtomValue(libraryAtom);
  const queueId = useAtomValue(queueIdAtom);
  const { getQueue } = useQueue();
  return useQuery(
    [QueryKeys.PLAYQUEUE, queueId],
    () => getQueue(),
    {
      enabled: queueId !== 0 && !!library,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
};

export const useNowPlaying = () => {
  const library = useAtomValue(libraryAtom);
  const queueId = useAtomValue(queueIdAtom);
  const { getQueue } = useQueue();
  return useQuery(
    [QueryKeys.PLAYQUEUE, queueId],
    () => getQueue(),
    {
      enabled: queueId !== 0 && !!library,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (data) => {
        const currentIndex = data.items.findIndex((item) => item.id === data.selectedItemId);
        return data.items[currentIndex];
      },
    },
  );
};

export const useUser = () => {
  const account = useAtomValue(accountAtom);
  return useQuery(
    [QueryKeys.USER],
    () => account.info(),
    {
      enabled: !!account,
      refetchOnWindowFocus: false,
    },
  );
};
