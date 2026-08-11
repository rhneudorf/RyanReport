import Parser from "rss-parser";
import path from "path";
import { fileURLToPath } from "url";

const parser = new Parser();

const feeds = [
  // -----------------------------
  // OFFICIAL ECONOMIC SOURCES
  // -----------------------------
  {
    name: "Bank of Canada",
    url: "https://www.bankofcanada.ca/utility/news/feed/",
    category: "Your Money",
  },
  {
    name: "Statistics Canada - Economic Accounts",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/36-eng.atom",
    category: "Your Money",
  },
  {
    name: "Statistics Canada - Labour",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/14-eng.atom",
    category: "Your Money",
  },
  {
    name: "Statistics Canada - Prices",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/18-eng.atom",
    category: "Your Money",
  },
  {
    name: "Statistics Canada - International Trade",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/12-eng.atom",
    category: "Manufacturing & Trade",
  },
  {
    name: "Statistics Canada - Manufacturing",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/16-eng.atom",
    category: "Manufacturing & Trade",
  },
  {
    name: "Statistics Canada - Housing",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/46-eng.atom",
    category: "Your Money",
  },
  {
    name: "Statistics Canada - Science & Technology",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/27-eng.atom",
    category: "Engineering",
  },

  // -----------------------------
  // GLOBAL NEWS — DAILY NEWS
  // -----------------------------
  {
    name: "Global News - Hamilton",
    url: "https://globalnews.ca/hamilton/feed/",
    category: "Local News",
  },
  {
    name: "Global News - Canada",
    url: "https://globalnews.ca/canada/feed/",
    category: "Canada",
  },
  {
    name: "Global News - National",
    url: "https://globalnews.ca/national/feed/",
    category: "Top Stories",
  },
  {
    name: "Global News - World",
    url: "https://globalnews.ca/world/feed/",
    category: "Around the World",
  },
  {
    name: "Global News - Money",
    url: "https://globalnews.ca/money/feed/",
    category: "Your Money",
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
    // Common XML/Atom text properties
    for (const key of ["_", "#text", "text", "value"]) {
      if (value[key] != null) {
        const result = getText(value[key]);
        if (result) return result;
      }
    }

    // Last-resort: search the object's values for usable text
    for (const child of Object.values(value)) {
      const result = getText(child);
      if (result) return result;
    }
  }

  return "";
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
    .replace(/\s+/g, " ")
    .trim();
}

export async function collectNews() {
  const stories = [];

  for (const feed of feeds) {
    try {
      console.log(`Fetching ${feed.name}...`);

      const result = await parser.parseURL(feed.url);

      for (const item of result.items || []) {
        const headline = getText(item.title).trim();

        if (!headline) {
          continue;
        }

        stories.push({
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
        });
      }
    } catch (error) {
      console.error(
        `Failed to fetch ${feed.name}: ${error.message}`
      );
    }
  }

  // Remove duplicate headlines
  const seen = new Set();

  const deduped = stories.filter((story) => {
    const key = normalizeTitle(story.headline);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  // Keep stories from the last 72 hours.
  const recentStories = deduped.filter((story) => {
    if (!story.publishedAt) {
      return true;
    }

    const publishedTime = new Date(story.publishedAt).getTime();

    if (Number.isNaN(publishedTime)) {
      return true;
    }

    const age = Date.now() - publishedTime;

    return age <= 1000 * 60 * 60 * 24 * 14;
  });

  // Newest first
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

// TEST MODE
const currentFile = fileURLToPath(import.meta.url);
const executedFile = path.resolve(process.argv[1]);

if (path.resolve(currentFile) === executedFile) {
  console.log("\nStarting Ryan Report news collector...\n");

  const stories = await collectNews();

  console.log(`\nCollected ${stories.length} recent stories.`);

  if (stories.length === 0) {
    console.log(
      "\nNo stories were collected. Check the feed errors above."
    );
  }

  for (const story of stories.slice(0, 15)) {
    console.log("\n----------------------------------------");
    console.log(`[${story.category}]`);
    console.log(story.headline);
    console.log(`Source: ${story.source}`);
    console.log(`Published: ${story.publishedAt || "No date"}`);
    console.log(`URL: ${story.url}`);
  }

  console.log("\n----------------------------------------");
  console.log("Collector test complete.\n");
}