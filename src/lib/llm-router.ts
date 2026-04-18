import Anthropic from "@anthropic-ai/sdk";
import * as FairHousing from "./prompts/fair-housing";
import * as MlsDescription from "./prompts/mls-description";
import * as CmaSummary from "./prompts/cma-summary";
import * as VideoScript from "./prompts/video-script";
import * as SellerPresentation from "./prompts/seller-presentation";

// ── Model IDs ──────────────────────────────────────────────────────────────
const HAIKU = "claude-haiku-4-5-20251001";
const SONNET = "claude-sonnet-4-6";

// ── Cost per million tokens (USD) ─────────────────────────────────────────
const COST: Record<string, { input: number; output: number }> = {
  [HAIKU]:  { input: 0.80,  output: 4.00  },
  [SONNET]: { input: 3.00,  output: 15.00 },
};

// ── Task registry ──────────────────────────────────────────────────────────
export type TaskType =
  | "fair-housing"
  | "mls-description"
  | "cma-summary"
  | "video-script"
  | "seller-presentation";

interface TaskConfig {
  model: string;
  maxTokens: number;
  system: string;
  buildUserPrompt: (vars: Record<string, unknown>) => string;
}

const TASKS: Record<TaskType, TaskConfig> = {
  "fair-housing": {
    model: HAIKU,
    maxTokens: 600,
    system: FairHousing.SYSTEM,
    buildUserPrompt: (v) => FairHousing.userPrompt(v as Parameters<typeof FairHousing.userPrompt>[0]),
  },
  "mls-description": {
    model: SONNET,
    maxTokens: 500,
    system: MlsDescription.SYSTEM,
    buildUserPrompt: (v) => MlsDescription.userPrompt(v as Parameters<typeof MlsDescription.userPrompt>[0]),
  },
  "cma-summary": {
    model: SONNET,
    maxTokens: 800,
    system: CmaSummary.SYSTEM,
    buildUserPrompt: (v) => CmaSummary.userPrompt(v as Parameters<typeof CmaSummary.userPrompt>[0]),
  },
  "video-script": {
    model: SONNET,
    maxTokens: 900,
    system: VideoScript.SYSTEM,
    buildUserPrompt: (v) => VideoScript.userPrompt(v as Parameters<typeof VideoScript.userPrompt>[0]),
  },
  "seller-presentation": {
    model: HAIKU,
    maxTokens: 700,
    system: SellerPresentation.SYSTEM,
    buildUserPrompt: (v) => SellerPresentation.userPrompt(v as Parameters<typeof SellerPresentation.userPrompt>[0]),
  },
};

// ── Result shape ───────────────────────────────────────────────────────────
export interface RouteResult {
  text: string;
  task: TaskType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

// ── Singleton client ───────────────────────────────────────────────────────
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// ── MLS screenshot extraction (vision, Haiku) ─────────────────────────────
export interface ExtractedListing {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  agentNotes: string;
}

export async function extractFromScreenshot(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg"
): Promise<ExtractedListing> {
  const response = await client().messages.create({
    model: HAIKU,
    max_tokens: 512,
    system: "You are a real estate data extractor. Given an MLS listing screenshot, extract property details and return valid JSON only — no markdown, no explanation.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Extract listing details from this MLS screenshot. Return ONLY a JSON object with exactly these fields (use 0 for missing numbers, "" for missing strings):
{"address":"","city":"","state":"","price":0,"bedrooms":0,"bathrooms":0,"sqft":0,"yearBuilt":0,"agentNotes":""}`,
          },
        ],
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned) as ExtractedListing;
}

// ── Main router ────────────────────────────────────────────────────────────
export async function route(
  task: TaskType,
  variables: Record<string, unknown>
): Promise<RouteResult> {
  const cfg = TASKS[task];

  const response = await client().messages.create({
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system: [
      {
        type: "text",
        text: cfg.system,
        // Cache the static system prompt — saves input tokens on repeated calls
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: cfg.buildUserPrompt(variables) },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const rates = COST[cfg.model];
  const estimatedCostUsd =
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output;

  return {
    text,
    task,
    model: cfg.model,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
  };
}
