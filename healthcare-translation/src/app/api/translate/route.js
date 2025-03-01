import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, outputLang } = await req.json();

    if (!text || !outputLang) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional medical translator.",
          },
          {
            role: "user",
            content: `Translate the following text to ${outputLang}: ${text}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json(
      { translation: data.choices[0].message.content },
      { status: 200 }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
