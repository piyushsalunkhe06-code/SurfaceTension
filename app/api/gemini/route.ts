import { NextResponse } from "next/server";
import { askOceanGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const answer = await askOceanGemini(prompt, context);
    return NextResponse.json({ text: answer, model: "gemini-2.5-flash", status: "online" });
  } catch (err: any) {
    console.error("API /api/gemini Error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
