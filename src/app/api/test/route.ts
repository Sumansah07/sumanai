import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          error: "GROQ_API_KEY is not set in environment variables",
          help: "Please add GROQ_API_KEY to your .env.local file",
        },
        { status: 500 }
      );
    }

    // Check if the API key format looks correct (starts with gsk_)
    if (!apiKey.startsWith("gsk_")) {
      return NextResponse.json(
        {
          configured: true,
          warning: "API key format might be incorrect (should start with 'gsk_')",
          keyPrefix: apiKey.substring(0, 4) + "...",
        },
        { status: 200 }
      );
    }

    // Try to make a simple API call to verify the key works
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
      return NextResponse.json(
        {
          configured: true,
          valid: false,
          error: `API key is configured but not valid. Status: ${response.status}`,
          keyPrefix: apiKey.substring(0, 10) + "...",
          help: "Please check your API key at https://console.groq.com/keys",
        },
        { status: 401 }
      );
    }

    const data = await response.json();
    const modelCount = data.data?.length || 0;

    return NextResponse.json(
      {
        configured: true,
        valid: true,
        message: "API key is configured and working correctly",
        keyPrefix: apiKey.substring(0, 10) + "...",
        modelsAvailable: modelCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to test API configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
