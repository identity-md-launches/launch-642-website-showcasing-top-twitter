export type ReadType = "Article" | "Thread" | "Post";
export interface Read {
  id: string;
  url: string;
  author: string;
  name: string;
  title: string;
  type: ReadType;
  date: string;
  timestamp: number;
  excerpt: string;
  topic: string;
  minutes: number | null;
  avatar: string | null;
  featured: boolean;
  art: string;
}
// Excerpts checked against the linked source posts on 2026-10-02.
export const reads: Read[] = [
  {
    id: "2106085777407164654",
    url: "https://x.com/notwashed/status/2106085777407164654",
    author: "notwashed",
    name: "washed",
    title: "A Better Factory",
    type: "Article",
    date: "2026-10-02T18:15:53.000Z",
    timestamp: 1790964953,
    excerpt:
      "I think the reality is we need better factories that can produce better things, not more ways to repackage the same thing. IMD feels like it can be that better factory.",
    topic: "The big picture",
    minutes: 8,
    avatar: null,
    featured: true,
    art: "factory",
  },
  {
    id: "2104546260195713113",
    url: "https://x.com/Bankless/status/2104546260195713113",
    author: "Bankless",
    name: "Bankless",
    title: "Inside IMD, Ethereum's New AI Swarm Experiment",
    type: "Article",
    date: "2026-09-28T12:18:23.000Z",
    timestamp: 1790597903,
    excerpt:
      "A new kind of AI workforce is ascending in the Ethereum ecosystem, replete with experimental tokenomics.",
    topic: "AI workforce",
    minutes: 8,
    avatar: "./images/Bankless.jpg",
    featured: false,
    art: "swarm",
  },
  {
    id: "2102344092659134834",
    url: "https://x.com/nftimm/status/2102344092659134834",
    author: "nftimm",
    name: "nftimm",
    title: "$IMD: The Bull Case for a Billion-Dollar Meme Company",
    type: "Article",
    date: "2026-09-22T10:27:45.000Z",
    timestamp: 1790072866,
    excerpt:
      "IMD is a meme community becoming an AI-powered workforce that builds products, launches experiments and supplies infrastructure other projects use that currently sits at approx $16m market cap.",
    topic: "Community thesis",
    minutes: 4,
    avatar: "./images/nftimm.jpg",
    featured: false,
    art: "control",
  },
  {
    id: "2105396759342059873",
    url: "https://x.com/pegzeus/status/2105396759342059873",
    author: "pegzeus",
    name: "pegzeus",
    title: "A company without a company",
    type: "Post",
    date: "Wed Sep 30 20:37:58 +0000 2026",
    timestamp: 1790800678,
    excerpt:
      "ai + crypto finally let us go after these costs. ai can do the work, crypto can pay anyone, enforce the rules and align incentives. other agents can review the work before payment is released",
    topic: "Future of work",
    minutes: null,
    avatar: "./images/pegzeus.jpg",
    featured: false,
    art: "quote",
  },
  {
    id: "2103142412000600159",
    url: "https://x.com/AdamOnFinance/status/2103142412000600159",
    author: "AdamOnFinance",
    name: "AdamOnFinance",
    title: "The AI oracle thesis",
    type: "Post",
    date: "Thu Sep 24 15:20:00 +0000 2026",
    timestamp: 1790263200,
    excerpt: "$IMD uses AI to settle oracles and do other tasks",
    topic: "AI oracles",
    minutes: null,
    avatar: "./images/AdamOnFinance.jpg",
    featured: false,
    art: "oracle",
  },
  {
    id: "2102729939543863754",
    url: "https://x.com/joechalom/status/2102729939543863754",
    author: "joechalom",
    name: "Joseph Chalom",
    title:
      "The $4 Trillion Revolution: How AI Agents Will Rewire Finance and Spark an Economic Big Bang",
    type: "Article",
    date: "2026-09-23T12:00:59.000Z",
    timestamp: 1790164859,
    excerpt:
      "The convergence of new onchain financial primitives and unlimited agent attention promises unprecedented value creation for consumers. The battle over control has begun.",
    topic: "Wider perspective",
    minutes: 7,
    avatar: null,
    featured: false,
    art: "finance",
  },
  {
    id: "2103456907730276751",
    url: "https://x.com/0xNairolf/status/2103456907730276751",
    author: "0xNairolf",
    name: "nairolf",
    title: "“bro wat is imd?”",
    type: "Thread",
    date: "Fri Sep 25 12:09:41 +0000 2026",
    timestamp: 1790338181,
    excerpt: "An explanation of https://imd.fun, in (very) simple terms. 🧵",
    topic: "Start here",
    minutes: null,
    avatar: null,
    featured: false,
    art: "intro",
  },
];
