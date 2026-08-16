import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  Flag,
  Heart,
  Link2,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  Undo2,
} from "lucide-react";
import { apiRequest } from "../../lib/api";

const jsonList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const initials = (name) => String(name || "Admin").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const timeLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleString();
};

const riskStyle = {
  safe: "bg-jade/10 text-jade",
  suspicious: "bg-[#A57945]/10 text-[#A57945]",
  spam: "bg-coral/10 text-coral",
  fraud: "bg-coral text-white",
};

function CommunityMetric({ icon: Icon, label, value, tone }) {
  return <div className="panel flex items-center gap-4 p-4"><span className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${tone}`}><Icon size={18} /></span><span><b className="block text-xl">{value}</b><small className="text-[10px] font-bold text-muted">{label}</small></span></div>;
}

function AdminPost({ post, notify, onChanged, onModerate }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const tags = jsonList(post.tags);
  const reasons = jsonList(post.risk_reasons);
  const visible = post.status === "visible";

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      setComments(await apiRequest(`/community/posts/${post.id}/comments`));
    } catch (error) {
      notify(error.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) await loadComments();
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSavingComment(true);
    try {
      const created = await apiRequest(`/community/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText.trim() }),
      });
      setComments((current) => [...current, created]);
      setCommentText("");
      onChanged(post.id, { comments: Number(post.comments || 0) + 1 });
      notify("Administrator comment published.");
    } catch (error) {
      notify(error.message);
    } finally {
      setSavingComment(false);
    }
  };

  const removeComment = async (comment) => {
    if (!window.confirm("Remove this comment from the community?")) return;
    try {
      await apiRequest(`/community/comments/${comment.id}`, { method: "DELETE" });
      setComments((current) => current.filter((item) => item.id !== comment.id));
      onChanged(post.id, { comments: Math.max(0, Number(post.comments || 0) - 1) });
      notify("Comment removed.");
    } catch (error) {
      notify(error.message);
    }
  };

  const like = async () => {
    try {
      const result = await apiRequest(`/community/posts/${post.id}/like`, { method: "POST" });
      onChanged(post.id, { liked: result.liked, likes: Number(result.likes || 0) });
    } catch (error) {
      notify(error.message);
    }
  };

  const share = async () => {
    try {
      const result = await apiRequest(`/community/posts/${post.id}/share`, { method: "POST" });
      onChanged(post.id, { share_count: Number(result.share_count || 0) });
      if (navigator.clipboard) await navigator.clipboard.writeText(`${window.location.origin}/student?post=${post.id}`).catch(() => {});
      notify("Post link copied.");
    } catch (error) {
      notify(error.message);
    }
  };

  return (
    <article className="rounded-[24px] border border-ink/[0.08] bg-white/55 p-5 dark:bg-white/[0.035]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xs font-extrabold text-white ${post.author_role === "admin" ? "bg-plum" : "bg-cobalt"}`}>{initials(post.author)}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><b className="text-sm">{post.author}</b>{post.author_role === "admin" && <span className="tag !bg-plum/10 !text-plum">Admin</span>}<span className={`tag ${post.status === "visible" ? "!bg-jade/10 !text-jade" : post.status === "removed" ? "!bg-ink/10 !text-muted" : "!bg-coral/10 !text-coral"}`}>{String(post.status).replace("_", " ")}</span></div>
            <p className="mt-1 text-[10px] text-muted">{post.author_email} · {post.university || post.author_role} · {timeLabel(post.created_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`tag ${riskStyle[post.risk_label] || riskStyle.safe}`}><AlertTriangle size={11} /> {post.risk_label} · {Number(post.risk_score || 0)}</span>
          {Number(post.report_count || 0) > 0 && <span className="tag !bg-coral/10 !text-coral"><Flag size={11} /> {post.report_count} open report{Number(post.report_count) === 1 ? "" : "s"}</span>}
        </div>
      </div>

      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-ink/80 dark:text-white/75">{post.content}</p>
      {!!post.link_url && <a href={post.link_url} target="_blank" rel="noreferrer" className="mt-3 flex max-w-2xl items-center gap-2 rounded-xl bg-cobalt/5 px-3 py-2 text-xs font-bold text-cobalt"><Link2 size={14} /><span className="truncate">{post.link_url}</span><ExternalLink className="ml-auto shrink-0" size={13} /></a>}
      {!!tags.length && <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}
      {!!reasons.length && <div className="mt-4 rounded-2xl border border-coral/15 bg-coral/[0.06] p-3"><b className="text-xs text-coral">Automated review signals</b><ul className="mt-2 space-y-1">{reasons.map((reason) => <li className="flex gap-2 text-[11px] leading-5 text-muted" key={reason}><AlertTriangle className="mt-0.5 shrink-0 text-coral" size={12} />{reason}</li>)}</ul></div>}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/[0.07] pt-4">
        <button disabled={!visible} onClick={like} className={`btn-ghost min-h-9 disabled:opacity-35 ${Number(post.liked) === 1 ? "!text-coral" : ""}`}><Heart size={14} fill={Number(post.liked) === 1 ? "currentColor" : "none"} /> {Number(post.likes || 0)}</button>
        <button disabled={!visible} onClick={toggleComments} className="btn-ghost min-h-9 disabled:opacity-35"><MessageCircle size={14} /> {Number(post.comments || 0)}</button>
        <button disabled={!visible} onClick={share} className="btn-ghost min-h-9 disabled:opacity-35"><Share2 size={14} /> {Number(post.share_count || 0)}</button>
        <span className="flex-1" />
        <button onClick={() => onModerate(post, "rescan")} className="btn-secondary min-h-9"><RefreshCw size={14} /> Rescan</button>
        {post.status === "pending_review" && <button onClick={() => onModerate(post, "approve")} className="btn-secondary min-h-9 !text-jade"><Check size={14} /> Approve</button>}
        {post.status === "removed" ? <button onClick={() => onModerate(post, "restore")} className="btn-primary min-h-9 !bg-jade"><Undo2 size={14} /> Restore</button> : <button onClick={() => onModerate(post, "remove")} className="btn-primary min-h-9 !bg-coral"><Trash2 size={14} /> Remove</button>}
      </div>

      {commentsOpen && visible && (
        <div className="mt-4 rounded-2xl bg-ink/[0.025] p-3 dark:bg-white/[0.035]">
          <div className="flex gap-2"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitComment(); } }} className="input min-h-9" placeholder="Comment as CareerCube administrator..." maxLength={1500} /><button disabled={!commentText.trim() || savingComment} onClick={submitComment} className="btn-primary min-h-9 !bg-plum disabled:opacity-40">{savingComment ? <LoaderCircle className="animate-spin" size={14} /> : <Send size={14} />}</button></div>
          <div className="mt-3 space-y-2">
            {loadingComments && <p className="py-4 text-center text-xs text-muted"><LoaderCircle className="mr-2 inline animate-spin" size={14} /> Loading comments...</p>}
            {!loadingComments && !comments.length && <p className="py-3 text-center text-xs text-muted">No comments yet.</p>}
            {comments.map((comment) => <div key={comment.id} className="flex gap-2 rounded-xl bg-white/60 p-3 dark:bg-white/[0.04]"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[9px] font-bold text-white ${comment.author_role === "admin" ? "bg-plum" : "bg-cobalt"}`}>{initials(comment.author)}</span><div className="min-w-0 flex-1"><b className="text-xs">{comment.author}</b><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-muted">{comment.content}</p></div><button onClick={() => removeComment(comment)} className="text-muted hover:text-coral"><Trash2 size={13} /></button></div>)}
          </div>
        </div>
      )}
    </article>
  );
}

export default function AdminCommunity({ data, setData, loading, error, onRetry, onModerate, notify }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [topics, setTopics] = useState("");
  const [publishing, setPublishing] = useState(false);
  const posts = data.posts || [];
  const stats = data.stats || {};

  const filtered = useMemo(() => posts.filter((post) => {
    const textMatch = `${post.author} ${post.author_email} ${post.content}`.toLowerCase().includes(search.toLowerCase());
    if (!textMatch) return false;
    if (filter === "attention") return post.status === "pending_review" || Number(post.report_count || 0) > 0;
    if (filter === "reported") return Number(post.report_count || 0) > 0;
    if (filter === "all") return true;
    return post.status === filter;
  }), [filter, posts, search]);

  const publish = async () => {
    if (!content.trim()) return;
    setPublishing(true);
    try {
      const result = await apiRequest("/community/posts", {
        method: "POST",
        body: JSON.stringify({
          content: content.trim(),
          linkUrl: linkUrl.trim(),
          tags: topics.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      setContent("");
      setLinkUrl("");
      setTopics("");
      await onRetry({ silent: true });
      notify(result.message);
    } catch (requestError) {
      notify(requestError.message);
    } finally {
      setPublishing(false);
    }
  };

  const updatePost = (id, patch) => setData((current) => ({
    ...current,
    posts: current.posts.map((post) => Number(post.id) === Number(id) ? { ...post, ...patch } : post),
  }));

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CommunityMetric label="Total real posts" value={Number(stats.total || 0)} icon={MessageCircle} tone="bg-cobalt" />
        <CommunityMetric label="Visible to students" value={Number(stats.visible || 0)} icon={CheckCircle2} tone="bg-jade" />
        <CommunityMetric label="Needs review" value={Number(stats.pending || 0)} icon={AlertTriangle} tone="bg-coral" />
        <CommunityMetric label="Open reports" value={Number(stats.openReports || 0)} icon={Flag} tone="bg-plum" />
        <CommunityMetric label="Posts today" value={Number(stats.postsToday || 0)} icon={ShieldCheck} tone="bg-ink" />
      </section>

      <section className="panel p-5">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-plum text-xs font-extrabold text-white">CC</span><div className="flex-1"><h2 className="text-sm font-extrabold">Post as CareerCube administrator</h2><textarea value={content} onChange={(event) => setContent(event.target.value)} className="input mt-3 min-h-24 resize-y py-3" placeholder="Share an official update, answer a common question, or publish a verified resource..." maxLength={5000} /><div className="mt-3 grid gap-3 md:grid-cols-2"><input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} type="url" className="input" placeholder="Optional resource URL" /><input value={topics} onChange={(event) => setTopics(event.target.value)} className="input" placeholder="Topics, comma separated" /></div><div className="mt-3 flex justify-end"><button disabled={!content.trim() || publishing} onClick={publish} className="btn-primary !bg-plum disabled:opacity-40">{publishing ? "Publishing..." : "Publish official post"} <Send size={14} /></button></div></div></div>
      </section>

      <section className="glass flex flex-col gap-3 rounded-[24px] p-3 lg:flex-row">
        <label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-11" placeholder="Search author, email, or post content..." /></label>
        <select className="select lg:w-56" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="attention">Needs attention</option><option value="all">All posts</option><option value="visible">Visible</option><option value="pending_review">Pending review</option><option value="reported">Reported</option><option value="removed">Removed</option></select>
        <button onClick={() => onRetry()} className="btn-secondary"><RefreshCw size={14} /> Refresh</button>
      </section>

      <section className="panel p-5">
        <div className="mb-5 flex items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold">Live moderation workspace</h2><p className="text-xs text-muted">Automated signals assist review; administrators make the final decision.</p></div><span className="tag">{filtered.length} shown</span></div>
        {loading && <div className="py-16 text-center text-xs text-muted"><LoaderCircle className="mx-auto mb-3 animate-spin text-plum" /> Loading real community data...</div>}
        {!loading && error && <div className="py-14 text-center"><AlertTriangle className="mx-auto text-coral" /><h3 className="mt-3 font-extrabold">Could not load moderation data</h3><p className="mt-1 text-xs text-muted">{error}</p><button onClick={() => onRetry()} className="btn-secondary mt-5"><RefreshCw size={14} /> Try again</button></div>}
        {!loading && !error && <div className="space-y-3">{filtered.map((post) => <AdminPost key={post.id} post={post} notify={notify} onChanged={updatePost} onModerate={onModerate} />)}</div>}
        {!loading && !error && !filtered.length && <div className="py-16 text-center"><CheckCircle2 className="mx-auto text-jade" size={34} /><h3 className="mt-3 font-extrabold">{posts.length ? "No posts match this view" : "The real community is empty"}</h3><p className="mt-1 text-xs text-muted">{posts.length ? "Try another filter or search." : "Posts will appear here after a student or administrator publishes one."}</p></div>}
      </section>
    </div>
  );
}
