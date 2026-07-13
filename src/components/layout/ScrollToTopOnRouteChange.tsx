import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets scroll position to the top whenever the route pathname changes. */
export function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
