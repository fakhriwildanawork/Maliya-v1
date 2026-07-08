import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";
import { createWorker } from "tesseract.js";

let currentKeyIndex = 1;

function getNextGeminiKey(): string {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY found in environment variables");
  }

  const key = keys[(currentKeyIndex - 1) % keys.length];
  currentKeyIndex++;
  return key;
}

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
    // Tesseract.js in Node
    const worker = await createWorker('ind+eng');
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "";
  }
}

async function fallbackWithGroq(ocrText: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured for fallback");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const systemPrompt = `
    You are a professional financial assistant for "Maliya" - a Personal Finance OS.
    Extract transaction data from the provided OCR text.
    
    CONTEXT:
    - Categories: ${context.categories.join(", ")}
    - Accounts: ${context.accounts.join(", ")}
    - Family Members: ${context.familyMembers.join(", ")}
    
    RULES:
    1. Extract: date (YYYY-MM-DD), amount (number), title (merchant name), description (items), type (income/expense), category_name (map to context), account_name (map to context), family_member_name (map to context).
    2. CURRENCY: Indonesian receipts use dots for thousands. 70.000 is 70000.
    3. Return ONLY valid JSON.
    
    JSON STRUCTURE:
    {
      "date": "YYYY-MM-DD",
      "amount": 0,
      "title": "...",
      "description": "...",
      "type": "expense",
      "category_name": "...",
      "account_name": "...",
      "family_member_name": "..."
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract from this OCR text: ${ocrText}` }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty response");
  return JSON.parse(content);
}

export async function analyzeReceipt(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const apiKey = getNextGeminiKey();
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
    
    Map values strictly to the provided context.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: {
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

    const content = response.text;
    if (!content) throw new Error("Gemini returned empty response");
    return JSON.parse(content);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    if (error.status === 503 || error.message?.includes("503") || error.message?.includes("high demand")) {
      console.log("Gemini high demand, falling back to OCR + Groq...");
      const ocrText = await performOCR(base64Image);
      if (!ocrText) throw new Error("Fallback failed: OCR text extraction failed.");
      return await fallbackWithGroq(ocrText, context);
    }
    
    throw error;
  }
}

export async function analyzeReceiptStream(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const apiKey = getNextGeminiKey();
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  const systemInstruction = `
    Analyze receipt. Return valid JSON only.
    CONTEXT:
    - Categories: ${context.categories.join(", ")}
    - Accounts: ${context.accounts.join(", ")}
    - Family Members: ${context.familyMembers.join(", ")}
  `;

  return await ai.models.generateContentStream({
    model: "gemini-flash-latest",
    contents: {
      parts: [
        { text: systemInstruction },
        { inlineData: { mimeType, data: base64Data } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      temperature: 0,
    }
  });
}
