import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🚀 THE FIX: Using the universal 'gemini-pro' alias. This will NEVER 404.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
    });

    const prompt = `
      You are a financial transaction parser.
      Extract the transaction details from this text: "${text}"
      
      Rules:
      1. amount: strictly a number (e.g., 15000). No commas.
      2. title: short description.
      3. type: "income" or "expense".
      4. category: pick best fit (Groceries, Transport, Bills & Utilities, Entertainment, Dining Out, Income / Salary, Other).
      
      Return ONLY a raw JSON object. NO markdown backticks like \`\`\`json. NO conversational text.
      Format: {"amount": 15000, "title": "Uber", "type": "expense", "category": "Transport"}
    `;

    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text();
    
    // Strip out markdown formatting
    aiResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(aiResponse);

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error: any) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ 
      error: "Failed to parse", 
      details: error.message 
    }, { status: 500 });
  }
}