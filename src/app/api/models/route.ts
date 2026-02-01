import { NextResponse } from "next/server";
import { Model, ModelListResponse } from "@/types/chat";

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const apiBaseUrl =
      process.env.GROQ_API_BASE_URL || "https://api.groq.com/openai/v1";

    const response = await fetch(`${apiBaseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status}` },
        { status: response.status },
      );
    }

    const data: ModelListResponse = await response.json();

    // Filter out non-chat models (whisper, embedding models, etc.)
    const chatModels = data.data.filter((model: Model) => {
      const modelId = model.id.toLowerCase();
      return (
        !modelId.includes("whisper") &&
        !modelId.includes("embedding") &&
        !modelId.includes("moderation") &&
        !modelId.includes("tts") &&
        !modelId.includes("dall-e")
      );
    });

    // Sort models by context window size (larger first) for better UX
    chatModels.sort((a, b) => {
      const aContext = a.context_window || 0;
      const bContext = b.context_window || 0;
      return bContext - aContext;
    });

    return NextResponse.json({
      object: "list",
      data: chatModels,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    );
  }
}
