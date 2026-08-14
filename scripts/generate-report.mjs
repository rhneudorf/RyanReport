import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { collectNews } from "./news-collector.mjs";
import { collectMarketData } from "./market-data.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const profilePath = path.join(rootDir, "profile", "ryan.json");
const reportPath = path.join(rootDir, "data", "report.json");

loadEnv({ path: path.join(rootDir, ".env.local") });

function validateReportShape(report) {
  if (!report || typeof report !== "object") {
    throw new Error("Generated content is not an object.");
  }

  const requiredTopLevel = [
    "date",
    "morningSnapshot",
    "topStory",
    "stories",
    "markets",
    "yourMoney",
    "manufacturing",
    "world",
    "lookingAhead",
  ];

  for (const key of requiredTopLevel) {
    if (!(key in report)) {
      throw new Error(`Generated JSON is missing required field: ${key}`);
    }
  }

  if (
    typeof report.morningSnapshot?.headline !== "string" ||
    typeof report.morningSnapshot?.summary !== "string"
  ) {
    throw new Error("Generated morningSnapshot is invalid.");
  }

  if (
    typeof report.topStory?.headline !== "string" ||
    typeof report.topStory?.summary !== "string" ||
    typeof report.topStory?.whyItMatters !== "string" ||
    typeof report.topStory?.explainMore !== "string"
  ) {
    throw new Error("Generated topStory is invalid.");
  }

  if (!Array.isArray(report.stories) || report.stories.length === 0) {
    throw new Error("Generated stories array is invalid.");
  }

  if (
    !report.markets ||
    !Array.isArray(report.markets.items) ||
    typeof report.markets.insight !== "string"
  ) {
    throw new Error("Generated markets block is invalid.");
  }

  if (
    typeof report.yourMoney?.headline !== "string" ||
    typeof report.yourMoney?.summary !== "string" ||
    typeof report.yourMoney?.whyItMatters !== "string"
  ) {
    throw new Error("Generated yourMoney block is invalid.");
  }

  if (
    typeof report.manufacturing?.headline !== "string" ||
    typeof report.manufacturing?.summary !== "string" ||
    typeof report.manufacturing?.whyItMatters !== "string" ||
    typeof report.manufacturing?.engineeringHeadline !== "string" ||
    typeof report.manufacturing?.engineeringSummary !== "string"
  ) {
    throw new Error("Generated manufacturing block is invalid.");
  }

  if (
    typeof report.world?.headline !== "string" ||
    typeof report.world?.summary !== "string" ||
    typeof report.world?.whyItMatters !== "string"
  ) {
    throw new Error("Generated world block is invalid.");
  }

  if (!Array.isArray(report.lookingAhead) || report.lookingAhead.length === 0) {
    throw new Error("Generated lookingAhead block is invalid.");
  }

  return true;
}

function fallbackImage(category = "") {
  const text = category.toLowerCase();

  if (
    text.includes("manufactur") ||
    text.includes("engineering")
  ) {
    return "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80";
  }

  if (
    text.includes("money") ||
    text.includes("market")
  ) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80";
  }

  if (
    text.includes("local") ||
    text.includes("hamilton") ||
    text.includes("niagara")
  ) {
    return "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=80";
  }

  if (text.includes("world")) {
    return "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1000&q=80";
  }

  return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=80";
}

function normalizeUrl(url = "") {
  return String(url).trim().replace(/\/$/, "");
}

function findOriginalStory(generatedStory, sourceMaterial) {
  const generatedUrl = normalizeUrl(generatedStory.sourceUrl || "");

  if (generatedUrl) {
    const exactUrlMatch = sourceMaterial.find(
      (story) => normalizeUrl(story.url) === generatedUrl
    );

    if (exactUrlMatch) return exactUrlMatch;
  }

  const generatedHeadline = String(
    generatedStory.headline || ""
  ).toLowerCase().trim();

  if (generatedHeadline) {
    const exactHeadlineMatch = sourceMaterial.find(
      (story) =>
        String(story.headline || "").toLowerCase().trim() ===
        generatedHeadline
    );

    if (exactHeadlineMatch) return exactHeadlineMatch;
  }

  return null;
}

function applyArticleImage(generatedStory, sourceMaterial) {
  const originalStory = findOriginalStory(
    generatedStory,
    sourceMaterial
  );

  return {
    ...generatedStory,
    image:
      originalStory?.image ||
      generatedStory.image ||
      fallbackImage(generatedStory.category),
  };
}

async function generateLiveReport() {
  const profile = JSON.parse(
    fs.readFileSync(profilePath, "utf8")
  );

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key in .env.local."
    );
  }

  console.log("Collecting live news...");
  const collectedStories = await collectNews();

  if (!collectedStories.length) {
    throw new Error(
      "No live news stories were collected."
    );
  }

  console.log(
    `Collected ${collectedStories.length} live stories.`
  );

  console.log("Collecting live market data...");
  const marketData = await collectMarketData();

  const ai = new GoogleGenAI({ apiKey });

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const sourceMaterial = collectedStories.map(
    (story, index) => ({
      id: index + 1,
      headline: story.headline,
      source: story.source,
      category: story.category,
      publishedAt: story.publishedAt,
      url: story.url,
      summary: story.summary,
      image: story.image || "",
    })
  );

  const prompt = `
You are the editor of The Ryan Report.

Create a concise personalized morning newspaper using ONLY the supplied news and verified market data.

Reader profile:
${JSON.stringify(profile, null, 2)}

News source material:
${JSON.stringify(sourceMaterial, null, 2)}

Verified market data:
${JSON.stringify(marketData.items, null, 2)}

EDITORIAL RULES

- Do not invent current events, statistics or market values.
- Prefer recent, high-signal stories.
- Omit sports.
- Avoid redundant stories.
- Personalize relevance when genuinely useful.
- Every factual current-news claim must come from supplied source material.
- Every selected article must preserve its supplied source name and URL.
- If an article has a supplied image, use that image URL exactly.
- Otherwise leave image blank.
- The Top Story and Today's Edition contain the most important stories.
- The lower sections should add useful context and should NOT simply repeat the same wording from Today's Edition.
- If there is insufficient source material for a lower section, acknowledge that briefly instead of inventing developments.

IN DEPTH

For topStory and every item in stories:
- explainMore should provide 2-4 short paragraphs of deeper context.
- Remain grounded in the supplied source material.
- Do not add unsupported facts.

YOUR MONEY

Create one concise personal-finance/economic item based on the strongest available relevant source.
Focus on rates, inflation, mortgages, housing, taxes, utilities, insurance or investing when supported.

MANUFACTURING

Create:
1. one Manufacturing & Trade item
2. one Engineering Watch item

Prioritize Canada-U.S. trade, tariffs, steel, aluminum, Ontario manufacturing, automation, robotics, engineering and industrial technology.

WORLD

Choose one global story/theme with meaningful economic, investment, energy, manufacturing or geopolitical relevance.

LOOKING AHEAD

Provide 2-4 items representing events, releases or developments genuinely worth monitoring today or this week.
Do not invent scheduled dates.
Only use dates/events clearly supported by the supplied information.
If an exact future date is not supported, use a general label like "Today" or "This Week".

Return valid JSON only.

Required JSON:

{
  "date": "${today}",

  "morningSnapshot": {
    "headline": "string",
    "summary": "string"
  },

  "topStory": {
    "category": "string",
    "location": "string",
    "headline": "string",
    "summary": "string",
    "whyItMatters": "string",
    "explainMore": "string",
    "image": "string",
    "source": "string",
    "sourceUrl": "string"
  },

  "stories": [
    {
      "category": "string",
      "headline": "string",
      "summary": "string",
      "whyItMatters": "string",
      "explainMore": "string",
      "image": "string",
      "source": "string",
      "sourceUrl": "string"
    }
  ],

  "markets": {
    "items": [],
    "insight": "string"
  },

  "yourMoney": {
    "headline": "string",
    "summary": "string",
    "whyItMatters": "string",
    "source": "string",
    "sourceUrl": "string"
  },

  "manufacturing": {
    "headline": "string",
    "summary": "string",
    "whyItMatters": "string",
    "source": "string",
    "sourceUrl": "string",
    "engineeringHeadline": "string",
    "engineeringSummary": "string"
  },

  "world": {
    "headline": "string",
    "summary": "string",
    "whyItMatters": "string",
    "source": "string",
    "sourceUrl": "string"
  },

  "lookingAhead": [
    {
      "label": "string",
      "text": "string"
    }
  ]
}
`;

  console.log(
    "Sending news and markets to Gemini..."
  );

  const response =
    await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.25,
      },
    });

  const rawText = response?.text;

  if (!rawText) {
    throw new Error(
      "Gemini returned no content."
    );
  }

  let generated;

  try {
    generated = JSON.parse(rawText);
  } catch (error) {
    throw new Error(
      `Gemini returned invalid JSON: ${error.message}`
    );
  }

  validateReportShape(generated);

  generated.date = today;

  generated.topStory =
    applyArticleImage(
      generated.topStory,
      sourceMaterial
    );

  generated.stories =
    generated.stories.map((story) =>
      applyArticleImage(
        story,
        sourceMaterial
      )
    );

  generated.markets.items =
    marketData.items.map((item) => ({
      name: item.name,

      value:
        item.changePercent == null
          ? item.value
          : `${
              item.changePercent >= 0
                ? "▲"
                : "▼"
            } ${Math.abs(
              item.changePercent
            ).toFixed(2)}%`,

      positive: item.positive,
    }));

  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(generated, null, 2)}\n`
  );

  console.log(
    `✅ LIVE Ryan Report generated successfully for ${generated.date}.`
  );
}

try {
  await generateLiveReport();
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(
    `❌ Ryan Report generation failed: ${message}`
  );

  console.error(
    "Existing data/report.json was preserved."
  );

  process.exitCode = 1;
}