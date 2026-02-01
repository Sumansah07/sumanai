import { NextRequest, NextResponse } from "next/server";
import { ChatRequest } from "@/types/chat";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const body: ChatRequest = await req.json();
    const { model, messages, temperature, stream = true } = body;

    // Debug: Log the system prompt
    console.log('API received messages:', messages.length);
    if (messages[0]?.role === 'system') {
      console.log('System prompt received:', messages[0].content.substring(0, 100) + '...');
    }

    if (!model || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: model and messages are required" },
        { status: 400 },
      );
    }

    const apiBaseUrl =
      process.env.GROQ_API_BASE_URL || "https://api.groq.com/openai/v1";

    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        stream,
        max_tokens: body.max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);

      // Parse error message if possible
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorJson.error?.message || "Failed to generate response" },
          { status: response.status },
        );
      } catch {
        return NextResponse.json(
          { error: `Failed to generate response: ${response.status}` },
          { status: response.status },
        );
      }
    }

    // If streaming is enabled, return a streaming response
    if (stream && response.body) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Create a transform stream that will handle the SSE formatting
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              // Forward the SSE event as-is
              controller.enqueue(encoder.encode(line + "\n"));
            }
          }
        },
      });

      // Pipe the response through our transform stream
      const streamedResponse = response.body.pipeThrough(transformStream);

      return new Response(streamedResponse, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
