import { GoogleGenAI } from "@google/genai";

let currentKeyIndex = 1;

function getNextGeminiKey(): string {
  // Check keys from default and 1 to 5
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

  // Round robin rotation
  const key = keys[(currentKeyIndex - 1) % keys.length];
  currentKeyIndex++;
  return key;
}

export async function analyzeReceiptStream(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const apiKey = getNextGeminiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are a professional financial assistant for "Maliya" - a Personal Finance OS.
    Your task is to analyze a receipt image and extract transaction data.
    
    CONTEXT:
    - Available Categories: ${context.categories.join(", ")}
    - Available Accounts: ${context.accounts.join(", ")}
    - Available Family Members: ${context.familyMembers.join(", ")}
    
    RULES:
    1. Extract: date (YYYY-MM-DD), amount (number), title (short string, e.g., Store Name or Main Item), description (long string, e.g., list of all purchased items), type (income/expense), category_name (matching context), account_name (matching context), family_member_name (matching context).
    2. CURRENCY HANDLING (IMPORTANT): Indonesian receipts often use dots as thousand separators (e.g., 70.000). If you see a dot, analyze if it's likely a thousand separator or a decimal. In IDR context, 70.000 is 70000.
    3. OCR NOISE: Receipts can be messy. Use your reasoning to find the Total/Grand Total. If a number looks like it's missing trailing zeros (e.g., "70" instead of "70.000"), try to infer from context or other numbers in the list.
    4. Map category, account, and family member names to the provided lists as accurately as possible.
    5. Return ONLY a valid JSON object. No extra text.
    
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

  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  const mimeTypeMatch = base64Image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.0-flash',
    contents: [
      {
        role: "user",
        parts: [
          { text: systemInstruction },
          { text: "Analyze this receipt and return JSON as specified." },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            }
          }
        ],
      }
    ],
    config: {
      temperature: 0,
      responseMimeType: "application/json",
    }
  });

  return responseStream;
}

export async function analyzeReceipt(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  const apiKey = getNextGeminiKey();
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are a professional financial assistant for "Maliya" - a Personal Finance OS.
    Your task is to analyze a receipt image and extract transaction data.
    
    CONTEXT:
    - Available Categories: ${context.categories.join(", ")}
    - Available Accounts: ${context.accounts.join(", ")}
    - Available Family Members: ${context.familyMembers.join(", ")}
    
    RULES:
    1. Extract: date (YYYY-MM-DD), amount (number), title (short string, e.g., Store Name or Main Item), description (long string, e.g., list of all purchased items), type (income/expense), category_name (matching context), account_name (matching context), family_member_name (matching context).
    2. CURRENCY HANDLING (IMPORTANT): Indonesian receipts often use dots as thousand separators (e.g., 70.000). If you see a dot, analyze if it's likely a thousand separator or a decimal. In IDR context, 70.000 is 70000.
    3. OCR NOISE: Receipts can be messy. Use your reasoning to find the Total/Grand Total. If a number looks like it's missing trailing zeros (e.g., "70" instead of "70.000"), try to infer from context or other numbers in the list.
    4. Map category, account, and family member names to the provided lists as accurately as possible.
    5. Return ONLY a valid JSON object. No extra text.
    
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

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: "user",
        parts: [
          { text: systemInstruction },
          { text: "Analyze this receipt and return JSON as specified." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            }
          }
        ],
      }
    ],
    config: {
      temperature: 0,
      responseMimeType: "application/json",
    }
  });

  const content = response.text;
  if (!content) throw new Error("AI returned empty response");

  return JSON.parse(content);
}
