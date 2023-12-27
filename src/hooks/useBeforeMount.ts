import { useRef } from 'react';

export const useBeforeMount = (fn: () => void) => {
  const isMounted = useRef<boolean>(false);

  if (!isMounted.current) fn?.();

  isMounted.current = true;
};
