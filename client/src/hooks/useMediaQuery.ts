import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    mq.addEventListener('change', setMatches);
    return () => mq.removeEventListener('change', setMatches);
  }, [query]);
  
  return matches;
};