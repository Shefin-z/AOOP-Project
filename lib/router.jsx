import { createContext, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  useEffect(() => {
    const update = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
    });
    window.addEventListener("popstate", update);
    window.addEventListener("careerforge:navigate", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("careerforge:navigate", update);
    };
  }, []);

  const value = useMemo(() => ({
    ...location,
    navigate(to, { replace = false } = {}) {
      if (replace) window.history.replaceState({}, "", to);
      else window.history.pushState({}, "", to);
      window.dispatchEvent(new Event("careerforge:navigate"));
    },
  }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function useLocation() {
  return useContext(RouterContext);
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
