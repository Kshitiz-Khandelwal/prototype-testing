import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // ✅ FIX: Use a proper environment variable name
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is missing. Ensure GEMINI_API_KEY is set in your .env file.");
      // If the key is missing, return a message that allows the frontend to show a helpful error
      return NextResponse.json({ reply: "Server Error: API Key not configured." }, { status: 500 });
    }

    const response = await fetch(
      // ✅ FIX: Inject the correct environment variable value into the URL
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    // This check helps debug issues like an invalid key (which returns a non-200 status)
    if (!response.ok) {
        console.error("Gemini API returned an error status:", response.status);
    }

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I didn’t get that.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Error connecting to Gemini API" });
  }
}