import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, FileText, LayoutTemplate, LoaderCircle, Play, PlayCircle, Search, Sparkles, Youtube } from "lucide-react";

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
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skill, setSkill] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

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

  const libraryResources = useMemo(() => resources.filter((item) => !item.featured), [resources]);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(libraryResources.length / pageSize));
  const visibleResources = libraryResources.slice((page - 1) * pageSize, page * pageSize);
  const recommended = useMemo(() => [...resources].filter((item) => !item.featured).sort((left, right) => resourceScore(right, profile) - resourceScore(left, profile)).slice(0, 3), [resources, profile]);
  const hasProfileSignal = Boolean(profile.targetRole || profile.skills);

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

  async function findSkill(event, value = skill) {
    event?.preventDefault();
    const term = value.trim(); if (!term || !current?.id) return;
    setSkill(term); setSearching(true); setSearchResults(null); setError("");
    try { setSearchResults(await fetch(`${API_BASE_URL}/resources/search?skill=${encodeURIComponent(term)}`, { headers: { "X-User-Id": current.id } }).then(responseBody)); }
    catch (requestError) { setError(requestError.message); } finally { setSearching(false); }
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

    <section className="skill-resource-finder">
      <p className="eyebrow"><Youtube size={15} /> SKILL RESOURCE FINDER</p><h3>What skill do you want to gain?</h3><p>Search a skill for the five top-priority YouTube playlists worldwide. English, Hindi, and Bangla playlists compete on the same quality score.</p>
      <form onSubmit={findSkill}><label><Search size={20} /><input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="e.g. React, SQL, Figma, Python, public speaking" /></label><button disabled={searching || !skill.trim()} type="submit">Search playlists</button></form>
      <div className="skill-quick"><span>TRY:</span>{["React", "SQL", "Python", "Figma", "Public speaking"].map((item) => <button type="button" key={item} onClick={() => findSkill(null, item)}>{item}</button>)}</div>
      {searching ? <div className="skill-searching" role="status"><LoaderCircle size={37} /><b>Finding the best YouTube playlists for {skill}...</b><span>Checking CareerForge recommendations first, then ranking public playlists.</span></div> : !searchResults ? <div className="skill-empty"><Youtube size={27} /><b>Search the skill you want to learn</b><span>CareerForge will show matching administrator suggestions before public YouTube playlists.</span></div> : <div className="skill-results">
        {(searchResults.suggestions?.length > 0 || searchResults.videos?.length > 0) && <><div className="skill-result-heading"><BadgeCheck size={17} /><div><b>{searchResults.suggestions?.length > 0 ? "CareerForge pick and top-priority playlists" : "Top-priority YouTube playlists"}</b><span>{searchResults.suggestions?.length > 0 ? "Your administrator's matching pick is first; five highest-ranked playlists follow." : `${searchResults.videos.length} highest-ranked playlist${searchResults.videos.length === 1 ? "" : "s"} for ${skill}`}</span></div></div><div className="resource-grid skill-result-grid">{searchResults.suggestions?.map((item) => <ResourceCard key={item.id} resource={item} onToggle={toggle} updatingId={updatingId} />)}{searchResults.videos?.map((item) => <article className="resource-card video-result" key={item.id}><div className="resource-thumbnail">{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : <div className="resource-thumbnail-fallback youtube"><Youtube size={32} /></div>}<span className="resource-youtube-badge"><Youtube size={13} /> YouTube playlist</span></div><div className="resource-card-top"><span className="resource-provider">{item.providerName}</span></div><h4>{item.title}</h4><p className="resource-description">{item.description || "A ranked YouTube playlist for this skill."}</p><footer><span>Playlist</span><a href={item.resourceUrl} target="_blank" rel="noreferrer">Open playlist <ExternalLink size={14} /></a></footer></article>)}</div></>}
        {!searchResults.suggestions?.length && !searchResults.videos?.length && <div className="skill-empty"><Search size={27} /><b>{searchResults.youtubeMessage ? "YouTube results are unavailable" : "No matching result found"}</b><span>{searchResults.youtubeMessage || "Try a broader skill name."}</span></div>}
        {searchResults.youtubeMessage && searchResults.videos?.length > 0 && <p className="skill-youtube-message">{searchResults.youtubeMessage}</p>}
      </div>}
    </section>

    {error && <p className="form-error">{error}</p>}

    {!loading && libraryResources.length > 0 && <section className="resource-library">
      <div className="resource-section-heading"><div><p className="eyebrow">EXPLORE THE LIBRARY</p><h3>{libraryResources.length} resource{libraryResources.length === 1 ? "" : "s"} available</h3></div></div>
      <div className="resource-grid">{visibleResources.map((item) => <ResourceCard key={item.id} resource={item} onToggle={toggle} updatingId={updatingId} />)}</div>
      {totalPages > 1 && <nav className="resource-pagination" aria-label="Resource pages"><span>Page {page} of {totalPages}</span><div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((currentPage) => currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button type="button" key={pageNumber} className={page === pageNumber ? "active" : ""} aria-label={`Page ${pageNumber}`} aria-current={page === pageNumber ? "page" : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((currentPage) => currentPage + 1)}><ChevronRight size={16} /></button></div></nav>}
    </section>}

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
