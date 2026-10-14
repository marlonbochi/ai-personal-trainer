import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Server-only: reads the Gemini credentials. Only import from src/pages/api/*.

const DEFAULT_FALLBACK_MODEL = 'gemini-3.8-flash';
const MODEL_SEGMENT = /(\/models\/)[^/:?]+(?=:)/;

export interface GeminiBody {
  contents: { parts: { text: string }[] }[];
  generationConfig?: Record<string, unknown> & { thinkingConfig?: unknown };
}

export interface GeminiResult<T> {
  result: T;
  usedFallback: boolean;
}

// Carries only a status and a safe message, never the axios error (its `config`
// holds the request URL and headers, i.e. the API key).
export class GeminiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

export function deriveFallbackUrl(primaryUrl: string, model: string): string | null {
  return MODEL_SEGMENT.test(primaryUrl) ? primaryUrl.replace(MODEL_SEGMENT, `$1${model}`) : null;
}

// Fall back on "this model is unavailable" signals, not on our own bad requests.
export function isFallbackWorthy(error: unknown): boolean {
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status
    ?? (error as GeminiError | undefined)?.status;
  if (status === undefined) return true; // network error, timeout, or unusable output
  return status === 404 || status === 408 || status === 429 || status >= 500;
}

// `thinkingConfig` options differ between model generations (e.g. thinkingBudget
// vs thinkingLevel), so the fallback model gets its own default thinking.
function forFallback(body: GeminiBody): GeminiBody {
  if (!body.generationConfig || !('thinkingConfig' in body.generationConfig)) return body;
  const { thinkingConfig: _drop, ...generationConfig } = body.generationConfig;
  return { ...body, generationConfig };
}

async function attempt<T>(url: string, apiKey: string, body: GeminiBody, parse: (text: string) => T, timeoutMs: number): Promise<T> {
  let text: string | undefined;
  try {
    const response = await axios.post<any>(url, body, {
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      timeout: timeoutMs,
    });
    text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    throw new GeminiError(status ? `Gemini request failed with status ${status}` : 'Gemini request failed', status);
  }
  if (!text) throw new GeminiError('Invalid response format from Gemini API');
  try {
    return parse(text);
  } catch {
    throw new GeminiError('Failed to parse Gemini API response');
  }
}

export async function generateWithFallback<T>(
  body: GeminiBody,
  parse: (text: string) => T,
  options: { timeoutMs?: number } = {}
): Promise<GeminiResult<T>> {
  const apiKey = process.env.GEMINI_API_KEY;
  const primaryUrl = process.env.GEMINI_API_URL;
  if (!apiKey || !primaryUrl) {
    throw new GeminiError('GEMINI_API_KEY or GEMINI_API_URL is not configured');
  }
  const timeoutMs = options.timeoutMs ?? 90000;

  try {
    return { result: await attempt(primaryUrl, apiKey, body, parse, timeoutMs), usedFallback: false };
  } catch (primaryError) {
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL;
    const fallbackUrl = deriveFallbackUrl(primaryUrl, fallbackModel);
    if (!fallbackUrl || !isFallbackWorthy(primaryError)) throw primaryError;

    console.warn(`Gemini primary model failed (${(primaryError as GeminiError).message}); retrying with ${fallbackModel}`);
    return { result: await attempt(fallbackUrl, apiKey, forFallback(body), parse, timeoutMs), usedFallback: true };
  }
}
