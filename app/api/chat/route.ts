import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { streamChatCompletion, parseStreamResponse } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
type MessageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, message, model } = await request.json();

    if (!chatId || !message || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get chat messages for context
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    // Format messages for OpenRouter
    const formattedMessages =
      messages?.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: formatMessageContent(msg.content),
      })) || [];

    // Add new user message
    formattedMessages.push({
      role: "user",
      content: formatMessageContent(message),
    });

    // Save user message to database
    const { error: insertError } = await supabase.from("messages").insert({
      chat_id: chatId,
      role: "user",
      content: message,
    });

    if (insertError) {
      console.error("Error saving user message:", insertError);
    }

    // Stream response from OpenRouter
    const response = await streamChatCompletion({
      model,
      messages: formattedMessages,
    });

    // Create a streaming response
    const stream = parseStreamResponse(response);
    let fullResponse = "";

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // Save assistant message to database
                const { error: assistantError } = await supabase
                  .from("messages")
                  .insert({
                    chat_id: chatId,
                    role: "assistant",
                    content: { text: fullResponse },
                  });

                if (assistantError) {
                  console.error(
                    "Error saving assistant message:",
                    assistantError
                  );
                }

                controller.close();
                break;
              }

              const chunk = new TextDecoder().decode(value);
              fullResponse += chunk;
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatMessageContent(content: any): MessageContentPart[] {
  const parts: MessageContentPart[] = [];

  if (typeof content === "string") {
    parts.push({ type: "text", text: content });
    return parts;
  }

  if (content.text) {
    parts.push({ type: "text", text: content.text });
  }

  if (content.files && Array.isArray(content.files)) {
    content.files.forEach((file: any) => {
      if (file.type.startsWith("image/")) {
        parts.push({
          type: "image_url",
          image_url: { url: file.url },
        });
      } else {
        parts.push({
          type: "file",
          file: {
            filename: file.name,
            file_data: file.url,
          },
        });
      }
    });
  }

  return parts;
}
