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
    typeof report.topStory.category !== "string" ||
    typeof report.topStory.location !== "string" ||
    typeof report.topStory.headline !== "string" ||
    typeof report.topStory.summary !== "string" ||
    typeof report.topStory.whyItMatters !== "string" ||
    typeof report.topStory.explainMore !== "string" ||
    typeof report.topStory.source !== "string" ||
    typeof report.topStory.sourceUrl !== "string"
  ) {
    throw new Error("Generated topStory is invalid.");
  }

  if (!Array.isArray(report.stories) || report.stories.length === 0) {
    throw new Error("Generated stories array is invalid.");
  }

  for (const story of report.stories) {
    if (
      !story ||
      typeof story.category !== "string" ||
      typeof story.headline !== "string" ||
      typeof story.summary !== "string" ||
      typeof story.whyItMatters !== "string" ||
      typeof story.explainMore !== "string" ||
      typeof story.source !== "string" ||
      typeof story.sourceUrl !== "string"
    ) {
      throw new Error("A generated story is missing required fields.");
    }
  }

  if (
    !report.markets ||
    !Array.isArray(report.markets.items) ||
    typeof report.markets.insight !== "string"
  ) {
    throw new Error("Generated markets block is invalid.");
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
  const generatedUrl = normalizeUrl(
    generatedStory.sourceUrl || ""
  );

  if (generatedUrl) {
    const exactUrlMatch = sourceMaterial.find(
      (story) =>
        normalizeUrl(story.url) === generatedUrl
    );

    if (exactUrlMatch) {
      return exactUrlMatch;
    }
  }

  const generatedHeadline = String(
    generatedStory.headline || ""
  )
    .toLowerCase()
    .trim();

  if (generatedHeadline) {
    const exactHeadlineMatch = sourceMaterial.find(
      (story) =>
        String(story.headline || "")
          .toLowerCase()
          .trim() === generatedHeadline
    );

    if (exactHeadlineMatch) {
      return exactHeadlineMatch;
    }
  }

  return null;
}

function applyArticleImage(
  generatedStory,
  sourceMaterial
) {
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

Create a concise, personalized morning newspaper using ONLY the supplied news and verified market data.

Reader profile:
${JSON.stringify(profile, null, 2)}

News source material:
${JSON.stringify(sourceMaterial, null, 2)}

Verified market data:
${JSON.stringify(marketData.items, null, 2)}

Editorial rules:
- Do not invent current events.
- Do not invent statistics.
- Do not invent market values.
- Prefer recent, high-signal stories.
- Omit sports.
- Avoid redundant stories.
- Personalize "whyItMatters" using the reader profile only when genuinely relevant.
- Use the verified market data when writing the market insight.
- Every selected story must correspond to one supplied source story.
- Preserve the supplied source name and source URL.
- Do not invent image URLs.
- If the supplied source story has an image, return that exact image URL.
- If no image was supplied, leave image as an empty string.
- "explainMore" should provide a deeper explanation for a reader who wants more context.
- "explainMore" should normally be 2 to 4 short paragraphs.
- Explain useful background, implications, and relevant connections to the reader profile.
- Keep "explainMore" grounded ONLY in the supplied source material.
- Do not invent extra facts merely to make the explanation longer.
- If the supplied material does not support a detailed explanation, keep it shorter rather than speculate.
- Return valid JSON only.
- Do not wrap the response in markdown fences.

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
  }
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

  // Force verified market values into the final report.
  // Gemini may write the commentary, but it cannot alter the numbers.
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
    `${JSON.stringify(
      generated,
      null,
      2
    )}\n`
  );

  const realImageCount = [
    generated.topStory,
    ...generated.stories,
  ].filter(
    (story) =>
      findOriginalStory(
        story,
        sourceMaterial
      )?.image
  ).length;

  console.log(
    `✅ LIVE Ryan Report generated successfully for ${generated.date}.`
  );

  console.log(
    `Stories using real article images: ${realImageCount}/${
      generated.stories.length + 1
    }`
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