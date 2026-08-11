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
  ];

  for (const key of requiredTopLevel) {
    if (!(key in report)) {
      throw new Error(`Generated JSON is missing required field: ${key}`);
    }
  }

  if (
    !report.morningSnapshot ||
    typeof report.morningSnapshot.headline !== "string" ||
    typeof report.morningSnapshot.summary !== "string"
  ) {
    throw new Error("Generated morningSnapshot is invalid.");
  }

  if (
    !report.topStory ||
    typeof report.topStory.headline !== "string" ||
    typeof report.topStory.summary !== "string" ||
    typeof report.topStory.whyItMatters !== "string"
  ) {
    throw new Error("Generated topStory is invalid.");
  }

  if (!Array.isArray(report.stories) || report.stories.length === 0) {
    throw new Error("Generated stories array is invalid.");
  }

  if (
    !report.markets ||
    typeof report.markets.insight !== "string"
  ) {
    throw new Error("Generated markets block is invalid.");
  }

  return true;
}

function fallbackImage(category = "") {
  const text = category.toLowerCase();

  if (text.includes("manufactur") || text.includes("engineering")) {
    return "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80";
  }

  if (text.includes("money") || text.includes("market")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80";
  }

  if (text.includes("local")) {
    return "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1000&q=80";
  }

  return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=80";
}

async function generateLiveReport() {
  const profile = JSON.parse(
    fs.readFileSync(profilePath, "utf8")
  );

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key in .env.local.");
  }

  console.log("Collecting live news...");
  const collectedStories = await collectNews();

  if (!collectedStories.length) {
    throw new Error("No live news stories were collected.");
  }

  console.log(`Collected ${collectedStories.length} live stories.`);

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
    })
  );

  const prompt = `
You are the editor of The Ryan Report.

Create a concise, personalized morning newspaper using ONLY the supplied news and market data.

Reader profile:
${JSON.stringify(profile, null, 2)}

News source material:
${JSON.stringify(sourceMaterial, null, 2)}

Verified market data:
${JSON.stringify(marketData.items, null, 2)}

Rules:
- Do not invent current events.
- Do not invent market values.
- Prefer recent, high-signal stories.
- Omit sports.
- Avoid redundant stories.
- Personalize "whyItMatters" using the reader profile.
- Use the verified market data when writing the market insight.
- Return valid JSON only.

Required JSON shape:

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
    "image": "",
    "source": "string",
    "sourceUrl": "string"
  },
  "stories": [
    {
      "category": "string",
      "headline": "string",
      "summary": "string",
      "whyItMatters": "string",
      "image": "",
      "source": "string",
      "sourceUrl": "string"
    }
  ],
  "markets": {
    "items": [],
    "insight": "string"
  }
}
`;

  console.log("Sending news and markets to Gemini...");

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.25,
    },
  });

  const rawText = response?.text;

  if (!rawText) {
    throw new Error("Gemini returned no content.");
  }

  const generated = JSON.parse(rawText);

  validateReportShape(generated);

  generated.date = today;

  generated.topStory.image =
    generated.topStory.image ||
    fallbackImage(generated.topStory.category);

  generated.stories = generated.stories.map(
    (story) => ({
      ...story,
      image:
        story.image ||
        fallbackImage(story.category),
    })
  );

  // Force verified market values into final report
  generated.markets.items = marketData.items.map((item) => ({
    name: item.name,
    value:
      item.changePercent == null
        ? item.value
        : `${item.changePercent >= 0 ? "▲" : "▼"} ${Math.abs(
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
  console.error(
    `❌ Ryan Report generation failed: ${
      error instanceof Error ? error.message : String(error)
    }`
  );

  console.error(
    "Existing data/report.json was preserved."
  );

  process.exitCode = 1;
}