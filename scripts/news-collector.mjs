import Parser from "rss-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

const feeds = [
  {
    name: "Bank of Canada",
    url: "https://www.bankofcanada.ca/utility/news/feed/",
    category: "Your Money",
    maxStories: 8,
  },
  {
    name: "Statistics Canada - Economic Accounts",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/36-eng.atom",
    category: "Your Money",
    maxStories: 5,
  },
  {
    name: "Statistics Canada - Labour",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/14-eng.atom",
    category: "Your Money",
    maxStories: 5,
  },
  {
    name: "Statistics Canada - Prices",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/18-eng.atom",
    category: "Your Money",
    maxStories: 5,
  },
  {
    name: "Statistics Canada - International Trade",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/12-eng.atom",
    category: "Manufacturing & Trade",
    maxStories: 6,
  },
  {
    name: "Statistics Canada - Manufacturing",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/16-eng.atom",
    category: "Manufacturing & Trade",
    maxStories: 6,
  },
  {
    name: "Statistics Canada - Housing",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/46-eng.atom",
    category: "Your Money",
    maxStories: 4,
  },
  {
    name: "Statistics Canada - Science & Technology",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/27-eng.atom",
    category: "Engineering",
    maxStories: 6,
  },
  {
    name: "Global News - Hamilton",
    url: "https://globalnews.ca/hamilton/feed/",
    category: "Local",
    maxStories: 10,
  },
  {
    name: "Global News - Canada",
    url: "https://globalnews.ca/canada/feed/",
    category: "Canada",
    maxStories: 8,
  },
  {
    name: "Global News - National",
    url: "https://globalnews.ca/national/feed/",
    category: "Canada",
    maxStories: 6,
  },
  {
    name: "Global News - World",
    url: "https://globalnews.ca/world/feed/",
    category: "World",
    maxStories: 8,
  },
  {
    name: "Global News - Money",
    url: "https://globalnews.ca/money/feed/",
    category: "Your Money",
    maxStories: 6,
  },
  {
    name: "Canada.ca - Business & Industry",
    url: "https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Business+and+industry&format=atom&orderBy=desc&pick=100&publishedDate%3E=2021-10-25&sort=publishedDate&topic=businessandindustry",
    category: "Manufacturing & Trade",
    maxStories: 10,
  },
  {
    name: "Canada.ca - Science & Innovation",
    url: "https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Science+and+innovation&format=atom&orderBy=desc&pick=100&publishedDate%3E=2021-10-25&sort=publishedDate&topic=scienceandinnovation",
    category: "Engineering",
    maxStories: 10,
  },
  {
    name: "Canada.ca - ISED",
    url: "https://api.io.canada.ca/io-server/gc/news/en/v2?atomtitle=Innovation%2C+Science+and+Economic+Development+Canada&dept=departmentofindustry&format=atom&orderBy=desc&pick=50&publishedDate%3E=2021-07-23&sort=publishedDate",
    category: "Manufacturing & Trade",
    maxStories: 10,
  },
];

function getText(value) {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    for (const key of ["_", "#text", "text", "value"]) {
      if (value[key] != null) {
        const result = getText(value[key]);
        if (result) return result;
      }
    }

    for (const child of Object.values(value)) {
      const result = getText(child);
      if (result) return result;
    }
  }

  return "";
}

function getImageUrl(item) {
  if (item.enclosure?.url) return item.enclosure.url;

  const mediaContent = item.mediaContent;
  if (Array.isArray(mediaContent)) {
    for (const media of mediaContent) {
      if (media?.$?.url) return media.$.url;
      if (media?.url) return media.url;
    }
  }

  const mediaThumbnail = item.mediaThumbnail;
  if (Array.isArray(mediaThumbnail)) {
    for (const media of mediaThumbnail) {
      if (media?.$?.url) return media.$.url;
      if (media?.url) return media.url;
    }
  }

  const html =
    getText(item.content) ||
    getText(item.description) ||
    getText(item.summary);

  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return match?.[1] || "";
}

function normalizeTitle(title) {
  return getText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSummary(value) {
  return getText(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isSportsStory(story) {
  const text =
    `${story.headline} ${story.summary}`.toLowerCase();

  const sportsTerms = [
    "nhl",
    "nba",
    "nfl",
    "mlb",
    "cfl",
    "stanley cup",
    "super bowl",
    "blue jays",
    "maple leafs",
    "raptors",
    "argonauts",
    "tiger-cats",
    "ticats",
    "soccer",
    "hockey",
    "baseball",
    "basketball",
    "football",
  ];

  return sportsTerms.some((term) => text.includes(term));
}

export async function collectNews() {
  const stories = [];

  for (const feed of feeds) {
    try {
      console.log(`Fetching ${feed.name}...`);

      const result = await parser.parseURL(feed.url);
      const feedStories = [];

      for (const item of result.items || []) {
        const headline = getText(item.title).trim();

        if (!headline) continue;

        const story = {
          headline,
          source: feed.name,
          category: feed.category,
          publishedAt:
            getText(item.isoDate) ||
            getText(item.pubDate) ||
            getText(item.updated) ||
            null,
          url: getText(item.link).trim(),
          summary: cleanSummary(
            item.contentSnippet ||
              item.content ||
              item.summary ||
              item.description ||
              ""
          ),
          image: getImageUrl(item),
        };

        if (isSportsStory(story)) continue;

        feedStories.push(story);
      }

      feedStories.sort((a, b) => {
        const dateA = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : 0;

        const dateB = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : 0;

        return dateB - dateA;
      });

      stories.push(...feedStories.slice(0, feed.maxStories));
    } catch (error) {
      console.error(
        `⚠️ Failed to fetch ${feed.name}: ${error.message}`
      );
    }
  }

  const seen = new Set();

  const deduped = stories.filter((story) => {
    const key = normalizeTitle(story.headline);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });

  const recentStories = deduped.filter((story) => {
    if (!story.publishedAt) return true;

    const published = new Date(story.publishedAt).getTime();

    if (Number.isNaN(published)) return true;

    const age = Date.now() - published;

    const isPrimarySource =
      story.source.includes("Bank of Canada") ||
      story.source.includes("Statistics Canada");

    const maxAge = isPrimarySource
      ? 1000 * 60 * 60 * 24 * 14
      : 1000 * 60 * 60 * 24 * 3;

    return age <= maxAge;
  });

  recentStories.sort((a, b) => {
    const dateA = a.publishedAt
      ? new Date(a.publishedAt).getTime()
      : 0;

    const dateB = b.publishedAt
      ? new Date(b.publishedAt).getTime()
      : 0;

    return dateB - dateA;
  });

  return recentStories.slice(0, 60);
}

const __filename = fileURLToPath(import.meta.url);

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  console.log("\nStarting Ryan Report news collector...\n");

  const stories = await collectNews();

  console.log(`\n✅ Collected ${stories.length} recent stories.\n`);

  const categoryCounts = {};
  let imagesFound = 0;

  for (const story of stories) {
    categoryCounts[story.category] =
      (categoryCounts[story.category] || 0) + 1;

    if (story.image) imagesFound++;
  }

  console.log("SOURCE MIX:");

  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`  ${category}: ${count}`);
  }

  console.log(`\nImages found: ${imagesFound}/${stories.length}`);
}