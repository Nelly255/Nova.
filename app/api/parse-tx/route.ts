import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 🚀 The Magic Prompt
    const prompt = `
      You are a financial transaction parser for a wealth management app.
      Analyze the following user input and extract the transaction details.
      
      Rules:
      1. amount: strictly a number (e.g., 15000). Remove commas or currency symbols.
      2. title: a short, clean description (e.g., "Uber Ride", "Salary").
      3. type: strictly "income" or "expense".
      4. category: strictly pick ONE of the following: "Food & Dining", "Transport", "Housing", "Entertainment", "Utilities", "Shopping", "Healthcare", "Salary", "Business", "Other".
      
      User Input: "${text}"
      
      Return ONLY a raw, minified JSON object. No markdown formatting, no backticks, no explanations. 
      Format: {"amount": number, "title": "string", "type": "string", "category": "string"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Fast and cheap for this specific task
      messages: [{ role: "user", content: prompt }],
      temperature: 0, // 0 makes it highly consistent and robotic
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) throw new Error("No response from AI");

    // Parse the JSON string returned by the AI into a real JavaScript object
    const parsedData = JSON.parse(aiResponse);

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ error: "Failed to parse transaction" }, { status: 500 });
  }
}