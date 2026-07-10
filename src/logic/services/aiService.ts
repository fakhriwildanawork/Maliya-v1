import { GoogleGenAI } from "@google/genai";

export async function analyzeReceipt(imageBase64: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  try {
    if (!imageBase64) {
      throw new Error("Gagal membaca gambar. Pastikan gambar jelas.");
    }

    console.log("Analyzing image directly with Gemini Flash...");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Determine mimeType from base64 string
    const match = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }
    
    const systemPrompt = `
      You are an elite financial data extractor for "Maliya" - a Personal Finance OS.
      Your task is to analyze the provided receipt image and extract structured JSON data.
      
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
      
      STRICT OUTPUT:
      Return ONLY a valid JSON object. No preamble, no explanation.
    `;
    
    const schema = {
      type: "OBJECT",
      properties: {
        date: { type: "STRING", description: "YYYY-MM-DD format" },
        amount: { type: "NUMBER", description: "Total amount" },
        title: { type: "STRING", description: "Merchant name or transaction title" },
        description: { type: "STRING", description: "Summary of items purchased" },
        type: { type: "STRING", description: "expense or income" },
        category_name: { type: "STRING" },
        account_name: { type: "STRING" },
        family_member_name: { type: "STRING" }
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        systemPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    const content = response.text;
    if (!content) throw new Error("Gemini returned empty response");
    
    const result = JSON.parse(content);
    console.log("Analysis successful.");
    return result;

  } catch (error: any) {
    console.error("AI Analysis Error (Gemini):", error);
    throw error;
  }
}
