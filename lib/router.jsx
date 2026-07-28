import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);

function readLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const update = () => setLocation(readLocation());
    window.addEventListener("popstate", update);
    window.addEventListener("careerforge:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("careerforge:navigate", update);
    };
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const destination = new URL(to, window.location.href);
    const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;

    if (replace) window.history.replaceState({}, "", nextUrl);
    else window.history.pushState({}, "", nextUrl);

    // Update React directly so navigation never depends on effect timing.
    setLocation({
      pathname: destination.pathname,
      search: destination.search,
    });
  }, []);

  const value = useMemo(() => ({
    ...location,
    navigate,
  }), [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useNavigate must be used inside RouterProvider.");
  return context.navigate;
}

export function useLocation() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useLocation must be used inside RouterProvider.");
  return context;
}

export function Link({ to, children, onClick, target, ...props }) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          target === "_blank"
        ) return;
        event.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
