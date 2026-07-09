import Groq from "groq-sdk";

export async function analyzeReceipt(text: string, context: { categories: string[], accounts: string[], familyMembers: string[] }) {
  try {
    if (!text || text.trim().length < 5) {
      throw new Error("Gagal membaca teks dari gambar. Pastikan gambar jelas.");
    }

    console.log("OCR successful. Extracting data with Groq (llama-3.3-70b)...");

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const systemPrompt = `
      You are an elite financial data extractor for "Maliya" - a Personal Finance OS.
      Your task is to transform messy OCR text from Indonesian receipts into structured JSON.
      
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
        { role: "user", content: `OCR TEXT TO ANALYZE:\n${text}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty response");
    
    const result = JSON.parse(content);
    console.log("Analysis successful.");
    return result;

  } catch (error: any) {
    console.error("AI Analysis Error (Groq):", error);
    throw error;
  }
}
