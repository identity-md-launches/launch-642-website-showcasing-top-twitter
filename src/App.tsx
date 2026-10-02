import { useRef, useState, type KeyboardEvent } from "react";
import { reads, type Read, type ReadType } from "./data";
import { FrogMark, Icon, type IconName } from "./icons";

const storageKey = "the-swamp:saved:v1";
type Filter = "All reads" | ReadType;
type Sort = "curated" | "newest" | "oldest";
const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp * 1000));

function getSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && reads.some((read) => read.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

function Avatar({ read }: { read: Read }) {
  const [failed, setFailed] = useState(false);
  return read.avatar && !failed ? (
    <img
      className="avatar"
      src={read.avatar}
      alt=""
      width="36"
      height="36"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <span
      className={`avatar initials initials-${read.author}`}
      aria-hidden="true"
    >
      {read.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Cover({ read }: { read: Read }) {
  if (read.art === "factory")
    return (
      <img
        className="cover-image"
        src="./images/factory.svg"
        alt=""
        width="680"
        height="420"
      />
    );
  if (read.art === "control")
    return (
      <img
        className="cover-image"
        src="./images/nftimm-cover.jpg"
        alt=""
        width="1200"
        height="480"
        loading="lazy"
      />
    );
  if (read.art === "finance")
    return (
      <img
        className="cover-image"
        src="./images/joechalom-cover.jpg"
        alt=""
        width="1200"
        height="600"
        loading="lazy"
      />
    );
  if (read.art === "swarm")
    return (
      <div className="swarm-cover" aria-hidden="true">
        <div className="network-orbit orbit-one" />
        <div className="network-orbit orbit-two" />
        <span className="network-node node-one" />
        <span className="network-node node-two" />
        <span className="network-node node-three" />
        <div className="network-core">
          <FrogMark />
        </div>
        <span className="art-caption">Collective intelligence.</span>
        <span className="art-number">IMD / 002</span>
      </div>
    );
  if (read.art === "quote")
    return (
      <div className="quote-cover" aria-hidden="true">
        <span className="big-quote">“</span>
        <span>
          A company
          <br />
          without a company.
        </span>
        <Icon name="spark" />
      </div>
    );
  if (read.art === "oracle")
    return (
      <div className="oracle-cover" aria-hidden="true">
        <span className="terminal-heading">
          <span /> THE ORACLE THESIS
        </span>
        <span className="terminal-line">
          human questions.
          <br />
          <span className="terminal-indent">agent answers_</span>
        </span>
        <span className="terminal-footer">[ AI × CRYPTO ]</span>
      </div>
    );
  return (
    <div className="intro-cover" aria-hidden="true">
      <FrogMark />
      <span>
        Wait,
        <br />
        what is IMD?
      </span>
      <span className="scribble">↗</span>
    </div>
  );
}

function ReadCard({
  read,
  saved,
  onSave,
}: {
  read: Read;
  saved: boolean;
  onSave: (read: Read) => void;
}) {
  const icon: IconName =
    read.type === "Article"
      ? "article"
      : read.type === "Thread"
        ? "thread"
        : "post";
  return (
    <article
      className={`read-card ${read.featured ? "featured-card" : ""}`}
      data-read-id={read.id}
    >
      <div className={`card-cover cover-${read.art}`}>
        <Cover read={read} />
        {read.featured && (
          <span className="featured-label">
            <Icon name="spark" /> The featured read
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="format-badge">
            <Icon name={icon} />
            {read.type}
          </span>
          <span className="topic">{read.topic}</span>
        </div>
        <h3>
          <a
            href={read.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${read.title} — read on X (opens in a new tab)`}
          >
            {read.title}
          </a>
        </h3>
        <p className="excerpt">“{read.excerpt}”</p>
        <div className="byline">
          <Avatar read={read} />
          <div>
            <span className="author-name">{read.name}</span>
            <span className="author-handle">@{read.author}</span>
          </div>
          <div className="read-date">
            <time dateTime={new Date(read.timestamp * 1000).toISOString()}>
              {formatDate(read.timestamp)}
            </time>
            {read.minutes && <span>{read.minutes} min read</span>}
          </div>
        </div>
        <div className="card-actions">
          <a
            href={read.url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-link"
            aria-label={`Read ${read.type.toLowerCase()} by ${read.name} on X (opens in a new tab)`}
          >
            Read {read.type.toLowerCase()}
            <Icon name="arrow" />
          </a>
          <button
            type="button"
            className={`save-button ${saved ? "is-saved" : ""}`}
            onClick={() => onSave(read)}
            aria-pressed={saved}
            aria-label={`${saved ? "Unsave" : "Save"} ${read.title}`}
            title={saved ? "Remove from saved reads" : "Save for later"}
          >
            <Icon name="bookmark" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function App() {
  const [filter, setFilter] = useState<Filter>("All reads");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("curated");
  const [saved, setSaved] = useState(getSaved);
  const [savedOnly, setSavedOnly] = useState(false);
  const [status, setStatus] = useState("");
  const [storageNotice, setStorageNotice] = useState(false);
  const aboutRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedReads = reads.filter(
    (read) =>
      (!savedOnly || saved.includes(read.id)) &&
      (filter === "All reads" || read.type === filter) &&
      `${read.title} ${read.author} ${read.name} ${read.topic} ${read.excerpt}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const displayedReads = [...selectedReads].sort((a, b) =>
    sort === "newest"
      ? b.timestamp - a.timestamp
      : sort === "oldest"
        ? a.timestamp - b.timestamp
        : 0,
  );

  function toggleSave(read: Read) {
    const next = saved.includes(read.id)
      ? saved.filter((id) => id !== read.id)
      : [...saved, read.id];
    setSaved(next);
    if (savedOnly && !next.includes(read.id)) {
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLButtonElement>(
            ".read-grid .save-button, .empty-state button",
          )
          ?.focus(),
      );
    }
    setStatus(
      `${read.title} ${next.includes(read.id) ? "saved for later" : "removed from saved reads"}.`,
    );
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setStorageNotice(true);
    }
  }

  function reset() {
    setFilter("All reads");
    setQuery("");
    setSavedOnly(false);
    setSort("curated");
  }
  function keepDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls =
      event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  function openCollection(onlySaved: boolean) {
    setSavedOnly(onlySaved);
    setFilter("All reads");
    setQuery("");
    window.location.hash = "collection";
    document.getElementById("collection")?.scrollIntoView();
    document.getElementById("collection-title")?.focus({ preventScroll: true });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header container">
        <a className="brand" href="#" aria-label="The Swamp home">
          <FrogMark />
          <span>
            the swamp
            <span className="brand-subtitle">an identity.md reading room</span>
          </span>
          <span className="brand-period">✳</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a
            className={!savedOnly ? "nav-active" : ""}
            href="#collection"
            onClick={() => {
              setSavedOnly(false);
              setFilter("All reads");
              setQuery("");
            }}
          >
            The collection
          </a>
          <button type="button" onClick={() => aboutRef.current?.showModal()}>
            About the swamp
          </button>
          <button
            type="button"
            className={`nav-saved ${savedOnly ? "nav-active" : ""}`}
            onClick={() => openCollection(true)}
            aria-pressed={savedOnly}
          >
            <Icon name="bookmark" />
            Saved<span className="saved-count">{saved.length}</span>
          </button>
        </nav>
        <a
          className="visit-link"
          href="https://imd.fun/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit identity.md
          <Icon name="arrow" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>

      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="small-star">✳</span> Human-curated.
              Frog-powered.
            </div>
            <h1 id="hero-title">
              Big ideas.
              <br />
              Frog energy<span className="heading-dot">.</span>
            </h1>
            <p>
              The best of identity.md, all in one pond.
              <br className="desktop-break" /> Explore the articles, threads,
              and big takes
              <br className="desktop-break" /> behind a new kind of AI
              workforce.
            </p>
            <a className="primary-button" href="#collection">
              Explore the collection
              <Icon name="down" />
            </a>
            <div className="hero-proof">
              <div className="avatar-stack">
                <img
                  src="./images/Bankless.jpg"
                  width="30"
                  height="30"
                  alt=""
                />
                <img src="./images/nftimm.jpg" width="30" height="30" alt="" />
                <img src="./images/pegzeus.jpg" width="30" height="30" alt="" />
                <span>+4</span>
              </div>
              <span>7 voices. Plenty to think about.</span>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="./images/swamp-agents.svg"
              width="700"
              height="540"
              alt="Two Pepe agents equipped with a headset, an AI terminal, and a flying robot companion."
            />
            <div className="art-note">
              <span className="note-rule" /> Small frogs. Serious computing.
            </div>
          </div>
        </section>

        <div className="manifesto-strip">
          <div className="container">
            <span>Less noise. More signal.</span>
            <Icon name="spark" />
            <span>Armed with AI.</span>
            <Icon name="spark" />
            <span>Powered by the swarm.</span>
            <Icon name="spark" />
            <span>Stay curious, anon.</span>
            <Icon name="spark" />
          </div>
        </div>

        <section
          id="collection"
          className="collection container"
          aria-labelledby="collection-title"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow section-kicker">
                The reading room / 001
              </div>
              <h2 id="collection-title" tabIndex={-1}>
                {savedOnly
                  ? "Your corner of the swamp."
                  : "Signal from the swamp."}
              </h2>
              <p>
                {savedOnly
                  ? "The reads you kept for a quieter moment. Saved on this browser."
                  : "Good reads. Original voices. All in one place."}
              </p>
            </div>
            <span className="collection-total">
              <span>
                {String(savedOnly ? saved.length : reads.length).padStart(
                  2,
                  "0",
                )}
              </span>{" "}
              {savedOnly ? "saved reads" : "curated reads"}
              <Icon name="spark" />
            </span>
          </div>

          <div className="collection-controls">
            <div
              className="filter-group"
              role="group"
              aria-label="Filter by format"
            >
              {(["All reads", "Article", "Thread", "Post"] as Filter[]).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    className={filter === value ? "filter-active" : ""}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {value === "All reads" ? value : `${value}s`}
                    <span>
                      {
                        reads.filter(
                          (read) =>
                            (value === "All reads" || read.type === value) &&
                            (!savedOnly || saved.includes(read.id)),
                        ).length
                      }
                    </span>
                  </button>
                ),
              )}
            </div>
            <div className="search-field">
              <label htmlFor="search">Search collection</label>
              <div className="search-input">
                <Icon name="search" />
                <input
                  id="search"
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Topics, titles, or authors…"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                  >
                    <Icon name="close" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="results-bar">
            <p role="status" aria-atomic="true">
              {displayedReads.length}{" "}
              {displayedReads.length === 1 ? "read" : "reads"}
              {query
                ? ` matching “${query}”`
                : savedOnly
                  ? " in your collection"
                  : " worth your time"}
              {(filter !== "All reads" || query || savedOnly) && (
                <button type="button" className="reset-link" onClick={reset}>
                  Reset filters
                </button>
              )}
            </p>
            <div className="sort-control">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
              >
                <option value="curated">Curator’s picks</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
          {storageNotice && (
            <p className="storage-notice" role="status">
              Saved for this visit. Browser storage is unavailable, so your
              saved reads may reset when you leave.
            </p>
          )}
          <div className="read-grid">
            {displayedReads.map((read) => (
              <ReadCard
                key={read.id}
                read={read}
                saved={saved.includes(read.id)}
                onSave={toggleSave}
              />
            ))}
          </div>
          {!displayedReads.length && (
            <div className="empty-state">
              <FrogMark />
              <h3>
                {savedOnly && !saved.length
                  ? "A little quiet in here."
                  : "No reads in this part of the pond."}
              </h3>
              <p>
                {savedOnly && !saved.length
                  ? "Use the bookmark on any read to keep it here for later."
                  : "Try another author or topic, or clear the filters to see all seven reads."}
              </p>
              <button className="primary-button" type="button" onClick={reset}>
                Browse all reads
                <Icon name="arrow" />
              </button>
            </div>
          )}
          <div className="collection-footnote">
            <span>
              <Icon name="check" /> Handpicked, not algorithm-picked.
            </span>
            <span>Collection updated October 2, 2026 · Links open on X</span>
          </div>
        </section>

        <section
          className="swamp-note container"
          aria-labelledby="swamp-note-title"
        >
          <div className="note-icon">
            <FrogMark />
          </div>
          <div>
            <div className="eyebrow">Beyond the timeline</div>
            <h2 id="swamp-note-title">Meet the swarm behind the signal.</h2>
            <p>
              Curiosity is a good start. See what the identity.md community is
              building.
            </p>
          </div>
          <a
            className="secondary-button"
            href="https://imd.fun/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore identity.md
            <Icon name="arrow" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>
      </main>

      <footer className="site-footer container">
        <a className="footer-brand" href="#">
          <FrogMark />
          <span>the swamp</span>
        </a>
        <p>
          An independent community reading room.
          <br />
          Made for curious humans & capable frogs.
        </p>
        <button type="button" onClick={() => aboutRef.current?.showModal()}>
          About & sources
          <Icon name="arrow" />
        </button>
        <span className="footer-signoff">
          Stay green. Stay curious. <span>↗</span>
        </span>
      </footer>
      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>

      <dialog
        ref={aboutRef}
        className="about-dialog"
        aria-labelledby="about-title"
        onKeyDown={keepDialogFocus}
        onClick={(event) => {
          if (event.target === event.currentTarget) aboutRef.current?.close();
        }}
      >
        <div className="dialog-content">
          <div className="dialog-top">
            <FrogMark />
            <button
              type="button"
              className="close-button"
              aria-label="Close about the swamp"
              onClick={() => aboutRef.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="eyebrow">A small corner of the internet</div>
          <h2 id="about-title">Welcome to the swamp.</h2>
          <p>
            A community reading room for people curious about identity.md, its
            AI workforce, and the ideas around it.
          </p>
          <p>
            This independent collection brings together seven selected links.
            Article titles and quoted excerpts come from the original sources.
            Short posts have editorial titles. The Joseph Chalom article offers
            wider context on AI and finance; it is not an identity.md
            endorsement.
          </p>
          <div className="about-facts">
            <p>
              <strong>Handpicked, not ranked.</strong> “Curator’s picks” follows
              the collection’s editorial order. Reading times are estimates.
            </p>
            <p>
              <strong>Your own little library.</strong> Saved reads stay in this
              browser. No account needed.
            </p>
            <p>
              <strong>Go to the source.</strong> Every read opens the original
              post on X in a new tab. X may require sign-in. The collection is a
              snapshot from October 2, 2026.
            </p>
          </div>
          <h3>Original voices</h3>
          <div className="source-links">
            {reads.map((read) => (
              <a
                key={read.id}
                href={read.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{read.author}
                <Icon name="arrow" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => aboutRef.current?.close()}
          >
            Back to the reads
            <Icon name="down" />
          </button>
        </div>
      </dialog>
    </>
  );
}
