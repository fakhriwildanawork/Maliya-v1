import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function analyzeReceipt(base64Image: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  try {
    console.log("Starting Gemini AI Receipt Analysis...");

    const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Data = base64Image.replace(/^data:[^;]+;base64,/, '');

    const systemPrompt = `
      You are an elite financial data extractor for "Maliya" - a Personal Finance OS.
      Your task is to transform images of Indonesian receipts into structured JSON.
      
      CONTEXT (STRICT MAPPING):
      - Categories: ${context.categories.join(", ")}
      - Accounts: ${context.accounts.join(", ")}
      - Family Members: ${context.familyMembers.join(", ")}
      
      EXTRACTION RULES:
      1. DATE: Find the transaction date. Output in YYYY-MM-DD. If not found, use current date ${new Date().toISOString().split('T')[0]}.
      2. AMOUNT: Look for "TOTAL", "GRAND TOTAL", "BAYAR", or the largest number near the bottom. 
         - Indonesian format: dots (.) are thousand separators. "70.000" is 70000.
         - Remove any currency symbols like "Rp".
      3. TITLE: Merchant name or main transaction title.
      4. DESCRIPTION: Summary of items purchased.
      5. TYPE: Must be "expense" (default for receipts) or "income".
      6. MAPPING:
         - category_name: Select the BEST match from the Categories list above.
         - account_name: Select the BEST match from the Accounts list above.
         - family_member_name: Select the BEST match from the Family Members list above.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: systemPrompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            amount: { type: Type.NUMBER, description: "Total amount as number" },
            title: { type: Type.STRING, description: "Merchant or transaction title" },
            description: { type: Type.STRING, description: "Short summary of items" },
            type: { type: Type.STRING, description: "'expense' or 'income'" },
            category_name: { type: Type.STRING, description: "Best match from categories" },
            account_name: { type: Type.STRING, description: "Best match from accounts" },
            family_member_name: { type: Type.STRING, description: "Best match from family members" }
          },
          required: ["date", "amount", "title", "type"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini returned empty response");
    }

    const result = JSON.parse(resultText);
    console.log("Gemini Analysis successful.");
    return result;

  } catch (error: any) {
    console.error("Gemini AI Analysis Error:", error);
    throw error;
  }
}
