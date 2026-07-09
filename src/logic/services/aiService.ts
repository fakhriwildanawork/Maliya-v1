import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import { createWorker } from "tesseract.js";

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING, description: "Transaction date in YYYY-MM-DD format" },
    amount: { type: Type.NUMBER, description: "Total transaction amount" },
    title: { type: Type.STRING, description: "Short title or merchant name" },
    description: { type: Type.STRING, description: "Brief list of items or summary" },
    type: { type: Type.STRING, enum: ["income", "expense"], description: "Type of transaction" },
    category_name: { type: Type.STRING, description: "Best matching category from context" },
    account_name: { type: Type.STRING, description: "Best matching account from context" },
    family_member_name: { type: Type.STRING, description: "Best matching family member from context" },
  },
  required: ["date", "amount", "title", "type", "category_name", "account_name", "family_member_name"],
};

async function performOCR(base64Image: string): Promise<string> {
  try {
    console.log("Starting OCR process...");
    const worker = await createWorker('ind+eng');
    
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    console.log("OCR successful.");
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "";
  }
}

async function extractWithGroq(ocrText: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const systemPrompt = `
    You are an elite financial data extractor for "Maliya" - a Personal Finance OS.
    CONTEXT (STRICT MAPPING):
    - Categories: ${context.categories.join(", ")}
    - Accounts: ${context.accounts.join(", ")}
    - Family Members: ${context.familyMembers.join(", ")}
    
    Rules: Return ONLY valid JSON. Map values strictly to context. Indonesian dots are thousand separators.
    JSON structure: date(YYYY-MM-DD), amount(number), title, description, type(expense/income), category_name, account_name, family_member_name.
  `;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `OCR TEXT:\n${ocrText}` }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty response");
  return JSON.parse(content);
}

async function analyzeWithGemini(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  const systemInstruction = `
    Analyze this receipt image for Maliya Finance OS.
    CONTEXT:
    - Categories: ${context.categories.join(", ")}
    - Accounts: ${context.accounts.join(", ")}
    - Family Members: ${context.familyMembers.join(", ")}
    
    Map values strictly to the provided context. Return ONLY valid JSON.
  `;

  console.log("Attempting Gemini Vision analysis (Level 1)...");
  const result = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: {
      role: "user",
      parts: [
        { text: systemInstruction },
        { inlineData: { mimeType, data: base64Data } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: receiptSchema,
      temperature: 0,
    }
  });

  const content = result.text;
  if (!content) throw new Error("Gemini returned empty response");
  return JSON.parse(content);
}

export async function analyzeReceipt(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const TIMEOUT_MS = 35000; // 35 seconds total timeout
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Proses analisa melebihi batas waktu (timeout). Silakan coba lagi.")), TIMEOUT_MS)
  );

  const analysisPromise = (async () => {
    // Level 1: Gemini Vision
    try {
      const result = await analyzeWithGemini(base64Image, context);
      console.log("Level 1 (Gemini) success.");
      return result;
    } catch (geminiError: any) {
      console.warn("Level 1 (Gemini) failed, falling back to Level 2 (OCR + Groq)...", geminiError.message);
      
      // Level 2: OCR + Groq
      const ocrText = await performOCR(base64Image);
      if (!ocrText || ocrText.trim().length < 5) {
        throw new Error("Gagal membaca teks dari gambar. Pastikan gambar jelas.");
      }
      
      const result = await extractWithGroq(ocrText, context);
      console.log("Level 2 (OCR + Groq) success.");
      return result;
    }
  })();

  try {
    return await Promise.race([analysisPromise, timeoutPromise]);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
