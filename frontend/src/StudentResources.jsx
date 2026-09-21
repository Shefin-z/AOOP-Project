import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, FileText, LayoutTemplate, Play, PlayCircle, Search, Sparkles, Youtube } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function responseBody(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.detail || "Unable to load resources.");
  return data;
}

const typeDetails = {
  article: [BookOpen, "Article"],
  video: [PlayCircle, "Video"],
  course: [Sparkles, "Course"],
  pdf: [FileText, "PDF"],
  template: [LayoutTemplate, "Template"],
};

function resourceScore(resource, profile) {
  const terms = `${profile.targetRole || ""} ${profile.skills || ""}`.toLowerCase().split(/[,\s/]+/).filter((term) => term.length > 2);
  const searchable = `${resource.title || ""} ${resource.category || ""} ${resource.description || ""}`.toLowerCase();
  return terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
}

export function StudentResources() {
  const current = JSON.parse(localStorage.getItem("careerforge_session") || "null");
  const [resources, setResources] = useState([]);
  const [profile, setProfile] = useState({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("all");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!current?.id) { setError("Please sign in again."); setLoading(false); return; }
    const headers = { "X-User-Id": current.id };
    Promise.all([
      fetch(`${API_BASE_URL}/resources`, { headers }).then(responseBody),
      fetch(`${API_BASE_URL}/profiles/${current.id}`, { headers }).then(responseBody),
    ]).then(([resourceItems, studentProfile]) => {
      setResources(resourceItems);
      setProfile(studentProfile || {});
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(resources.map((item) => item.category).filter(Boolean)))], [resources]);
  const filtered = useMemo(() => resources.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesView = view === "all" || (view === "saved" && item.saved) || (view === "completed" && item.completed);
    const haystack = `${item.title || ""} ${item.description || ""} ${item.category || ""} ${item.type || ""}`.toLowerCase();
    return matchesCategory && matchesView && haystack.includes(query.trim().toLowerCase());
  }), [resources, category, query, view]);
  const featuredResources = useMemo(() => filtered.filter((item) => item.featured), [filtered]);
  const libraryResources = useMemo(() => filtered.filter((item) => !item.featured), [filtered]);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(libraryResources.length / pageSize));
  const visibleResources = libraryResources.slice((page - 1) * pageSize, page * pageSize);
  const recommended = useMemo(() => [...resources].filter((item) => !item.featured).sort((left, right) => resourceScore(right, profile) - resourceScore(left, profile)).slice(0, 3), [resources, profile]);
  const hasProfileSignal = Boolean(profile.targetRole || profile.skills);
  const savedCount = resources.filter((item) => item.saved).length;
  const completedCount = resources.filter((item) => item.completed).length;
  const completionPercent = resources.length ? Math.round((completedCount / resources.length) * 100) : 0;

  useEffect(() => { setPage(1); }, [query, category, view]);

  async function toggle(resource, field) {
    const key = `${field}-${resource.id}`;
    setUpdatingId(key);
    try {
      const progress = await fetch(`${API_BASE_URL}/resources/${resource.id}/${field}`, {
        method: "PUT", headers: { "X-User-Id": current.id },
      }).then(responseBody);
      setResources((items) => items.map((item) => item.id === resource.id ? { ...item, ...progress } : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId("");
    }
  }

  return <section className="student-resources">
    <header className="resources-hero">
      <div>
        <p className="eyebrow"><Sparkles size={14} /> LEARNING LIBRARY</p>
        <h2>Build skills for your next move.</h2>
        <p>Explore administrator-curated career guides, practical learning materials, and templates in one focused library.</p>
      </div>
      <div className="resource-total"><BookOpen size={19} /><b>{loading ? "…" : resources.length}</b><span>published resources</span></div>
    </header>

    {error && <p className="form-error">{error}</p>}

    {!loading && resources.length > 0 && <>
      <section className="resource-toolbar" aria-label="Resource filters">
        <label className="resource-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides, skills, or topics" aria-label="Search resources" /></label>
        <div className="resource-filter-groups">
          <label className="resource-topic-select"><span>Topic</span><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by topic">{categories.map((item) => <option key={item} value={item}>{item === "All" ? "All topics" : item}</option>)}</select></label>
          <div className="resource-views" role="group" aria-label="Filter by progress">
            {[['all', 'All'], ['saved', `Saved (${savedCount})`], ['completed', `Completed (${completedCount})`]].map(([value, label]) => <button type="button" key={value} className={view === value ? "active" : ""} onClick={() => setView(value)}>{label}</button>)}
          </div>
        </div>
      </section>

      <section className="resource-progress-panel" aria-label="Your learning progress">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h3>{completedCount} of {resources.length} resources completed</h3><p>Save useful material for later and mark it complete when you are done.</p></div>
        <div className="resource-progress-summary"><b>{completionPercent}%</b><span>complete</span><div className="resource-progress-meter" role="progressbar" aria-label="Resource completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completionPercent}><i style={{ width: `${completionPercent}%` }} /></div></div>
      </section>

      {featuredResources.length > 0 && <section className="resource-featured-section">
        <div className="resource-section-heading"><div><p className="eyebrow"><BadgeCheck size={14} /> CAREERFORGE RECOMMENDS</p><h3>Suggested by your platform</h3></div><p>These are hand-picked by your CareerForge administrator to give you a reliable next step.</p></div>
        <div className="resource-featured-grid">{featuredResources.map((item) => <ResourceCard key={item.id} resource={item} onToggle={toggle} updatingId={updatingId} />)}</div>
      </section>}

    </>}

    <section className="resource-library">
      <div className="resource-section-heading"><div><p className="eyebrow">EXPLORE THE LIBRARY</p><h3>{loading ? "Loading resources..." : resources.length ? `${libraryResources.length} resource${libraryResources.length === 1 ? "" : "s"} available` : "No resources published yet"}</h3></div>{resources.length > 0 && <span>{view === "saved" ? "Saved resources" : view === "completed" ? "Completed resources" : category === "All" ? "All topics" : category}</span>}</div>
      {loading ? <div className="resource-loading"><i /><i /><i /></div> : resources.length === 0 ? <div className="resource-empty"><span><BookOpen size={22} /></span><div><h3>Your learning library is getting ready.</h3><p>Published resources from your CareerForge administrator will appear here.</p></div></div> : libraryResources.length ? <><div className="resource-grid">{visibleResources.map((item) => <ResourceCard key={item.id} resource={item} onToggle={toggle} updatingId={updatingId} />)}</div>{totalPages > 1 && <nav className="resource-pagination" aria-label="Resource pages"><span>Page {page} of {totalPages}</span><div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((currentPage) => currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} className={page === pageNumber ? "active" : ""} aria-label={`Page ${pageNumber}`} aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((currentPage) => currentPage + 1)}><ChevronRight size={16} /></button></div></nav>}</> : filtered.length ? <div className="resource-empty"><span><BadgeCheck size={22} /></span><div><h3>Everything here is a CareerForge recommendation.</h3><p>Use the section above to start with your administrator’s suggested learning.</p></div></div> : <div className="resource-empty"><span><Search size={22} /></span><div><h3>No matching resources found.</h3><p>Try a different topic or clear the search to see all published materials.</p></div></div>}
    </section>

    {!loading && recommended.length > 0 && <section className="resource-recommendations">
      <div className="resource-section-heading"><div><p className="eyebrow">PICKED FOR YOUR DIRECTION</p><h3>{hasProfileSignal ? "Recommended for you" : "Start here"}</h3></div><p>{hasProfileSignal ? "Matched against your target role and skills." : "Add your target role and skills in your profile for more focused suggestions."}</p></div>
      <div className="resource-recommendation-grid">{recommended.map((item) => <ResourceCard key={item.id} resource={item} compact onToggle={toggle} updatingId={updatingId} />)}</div>
    </section>}
  </section>;
}

function ResourceCard({ resource, compact = false, onToggle, updatingId }) {
  const [Icon, typeLabel] = typeDetails[String(resource.type || "article").toLowerCase()] || typeDetails.article;
  const isYouTube = /youtube|youtu\.be/i.test(`${resource.providerName || ""} ${resource.resourceUrl || ""}`);
  const provider = resource.providerName || (isYouTube ? "YouTube" : "CareerForge library");
  return <article className={`resource-card${compact ? " compact" : ""}${resource.featured ? " featured" : ""}`}>
    <div className="resource-thumbnail">{resource.thumbnailUrl ? <img src={resource.thumbnailUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className={`resource-thumbnail-fallback${isYouTube ? " youtube" : ""}`}><Icon size={compact ? 28 : 36} /><Play size={compact ? 16 : 20} /></div>}<span className="resource-type">{typeLabel}</span>{resource.featured ? <span className="resource-platform-badge"><BadgeCheck size={13} /> CareerForge recommends</span> : isYouTube && <span className="resource-youtube-badge"><Youtube size={13} /> YouTube</span>}</div>
    <div className="resource-card-top"><span className="resource-type-icon"><Icon size={compact ? 17 : 19} /></span><span className="resource-provider">{provider}</span></div>
    <p className="resource-category">{resource.category || "Learning"}</p>
    <h4>{resource.title}</h4>
    <p className="resource-description">{resource.description || "A curated CareerForge resource to support your next step."}</p>
    {resource.featured && <p className="resource-recommendation-note"><BadgeCheck size={14} /> {resource.recommendationNote || "Suggested by your CareerForge administrator."}</p>}
    <footer><span>{resource.estimatedMinutes ? <><Clock3 size={14} /> {resource.estimatedMinutes} min</> : "Self-paced"}</span><a href={resource.resourceUrl} target="_blank" rel="noreferrer">{isYouTube ? "Watch on YouTube" : "Open resource"} <ExternalLink size={14} /></a></footer>
    <div className="resource-card-actions">
      <button type="button" className={resource.saved ? "active" : ""} aria-pressed={Boolean(resource.saved)} disabled={updatingId === `saved-${resource.id}`} onClick={() => onToggle(resource, "saved")}>{resource.saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {resource.saved ? "Saved" : "Save"}</button>
      <button type="button" className={resource.completed ? "active complete" : ""} aria-pressed={Boolean(resource.completed)} disabled={updatingId === `completed-${resource.id}`} onClick={() => onToggle(resource, "completed")}><CheckCircle2 size={15} /> {resource.completed ? "Completed" : "Mark complete"}</button>
    </div>
  </article>;
}
