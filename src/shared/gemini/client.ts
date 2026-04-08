import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-2.5-flash-lite";

let cachedClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
};

interface GenerateJsonParams {
  systemInstruction: string;
  userPrompt: string;
}

export const generateJson = async <T = unknown>({
  systemInstruction,
  userPrompt,
}: GenerateJsonParams): Promise<T> => {
  const client = getClient();

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini response was not valid JSON: ${text}`);
  }
};
