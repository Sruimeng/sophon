import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/**
 * Navigate with query string preserved
 */
export const useNavigateWithQuery = () => {
  const navigate = useNavigate();
  const navigateWithQuery = useCallback(
    (path: string) => {
      navigate(`${path}${window.location.search}`);
    },
    [navigate],
  );

  return navigateWithQuery;
};
