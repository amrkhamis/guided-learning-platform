import { createOpenAI } from "@ai-sdk/openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "meta-llama/llama-4-maverick";

export const openrouter = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

export const model = openrouter(process.env.OPENROUTER_MODEL || DEFAULT_MODEL);
