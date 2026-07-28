const NAVIGATION_TOKEN = "_cf_nav";

export function freshPath(to) {
  const url = new URL(to, window.location.origin);
  url.searchParams.set(NAVIGATION_TOKEN, Date.now().toString(36));
  return `${url.pathname}${url.search}${url.hash}`;
}

export function navigateFresh(to, { replace = true } = {}) {
  const destination = freshPath(to);
  if (replace) window.location.replace(destination);
  else window.location.assign(destination);
}

export function clearNavigationToken() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(NAVIGATION_TOKEN)) return;
  url.searchParams.delete(NAVIGATION_TOKEN);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}
