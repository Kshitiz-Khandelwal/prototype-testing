import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is missing. Ensure GEMINI_API_KEY is set in your .env file.");
      return NextResponse.json({ reply: "Server Error: API Key not configured." }, { status: 500 });
    }

    // Line 20: 🛠️ FIX: Replaced 'gemini-1.5-flash-latest' with the stable alias 'gemini-2.5-flash'
    const MODEL_NAME = "gemini-2.5-flash"; 

    const response = await fetch(
      // Updated the model name in the URL
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Gemini API returned an error status:", response.status, JSON.stringify(data));
        const errorMessage = data.error?.message || `API returned status ${response.status}.`;
        return NextResponse.json({ reply: `Gemini API Error: ${errorMessage}` }, { status: response.status });
    }

    const firstCandidate = data.candidates?.[0];
    
    let reply = firstCandidate?.content?.parts?.[0]?.text;

    if (!reply) {
      if (firstCandidate?.finishReason === 'SAFETY') {
          reply = "Sorry, your message was blocked by safety filters."
      } else {
          console.warn("Gemini API returned no text candidate. Full response data:", JSON.stringify(data));
          reply = "Sorry, I didn’t get that.";
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ reply: "Internal Server Error: Could not process the request." }, { status: 500 });
  }
}