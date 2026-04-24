import { useState, useEffect } from 'react';

export const useURLChange = () => {
  const [currentURL, setCurrentURL] = useState(window.location.href);
  const [queryParams, setQueryParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleURLChange = () => {
      setCurrentURL(window.location.href);
      setQueryParams(new URLSearchParams(window.location.search)); // Update query params
    };

    // Listen for URL changes
    window.addEventListener('popstate', handleURLChange);

    // Override pushState and replaceState to detect changes
    const pushState = history.pushState;
    history.pushState = function (...args) {
      pushState.apply(history, args);
      handleURLChange();
    };

    const replaceState = history.replaceState;
    history.replaceState = function (...args) {
      replaceState.apply(history, args);
      handleURLChange();
    };

    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);

  return { currentURL, queryParams };
};
