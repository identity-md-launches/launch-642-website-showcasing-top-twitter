export type IconName =
  | "arrow"
  | "down"
  | "bookmark"
  | "search"
  | "close"
  | "article"
  | "thread"
  | "post"
  | "spark"
  | "check";

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 19 19 5M5 5h14v14" />
      </>
    ),
    down: (
      <>
        <path d="M12 4v16m-7-7 7 7 7-7" />
      </>
    ),
    bookmark: <path d="M6 4h12v17l-6-4-6 4z" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    article: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    thread: (
      <>
        <path d="M6 3v12a5 5 0 0 0 5 5h6M10 5h10M10 10h10M12 15h8" />
        <circle cx="5" cy="4" r="2" />
      </>
    ),
    post: (
      <path d="M20 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    ),
    spark: (
      <>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function FrogMark() {
  return (
    <svg
      className="frog-mark"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 27c0-7 3-18 11-18 6 0 7 7 9 7s5-8 11-6c7 2 8 11 7 18-1 10-10 14-20 13S5 36 5 27Z"
        fill="currentColor"
      />
      <path d="M8 22h15m4 0h13" stroke="var(--color-page)" strokeWidth="3" />
      <path d="M16 24v3m18-3v3" stroke="var(--color-page)" strokeWidth="4" />
      <path
        d="M10 32c8 5 21 5 29-1"
        stroke="var(--color-page)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
