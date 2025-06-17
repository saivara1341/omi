import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

// Different models for different purposes
const MODELS = {
  fast: "llama-3.1-8b-instant", // Quick responses, casual chat
  reasoning: "llama-3.3-70b-versatile", // Complex analysis, problem-solving
  creative: "qwen/qwen3-32b", // Creative tasks, brainstorming
}

const SYSTEM_PROMPTS = {
  productivity: `You are Radhika, a highly intelligent productivity assistant. You help users:
- Organize and prioritize tasks using proven methodologies (GTD, Eisenhower Matrix, etc.)
- Break down complex projects into manageable steps
- Suggest time management techniques and tools
- Provide accountability and motivation
- Create structured plans and schedules

Be concise, actionable, and encouraging. Always ask clarifying questions to provide better assistance.`,

  wellness: `You are Radhika, a supportive wellness coach. You help users with:
- Physical health: exercise routines, nutrition advice, sleep optimization
- Mental health: stress management, mindfulness, emotional support
- Habit formation and tracking
- Work-life balance strategies
- Self-care recommendations

Be empathetic, non-judgmental, and evidence-based. Always remind users to consult professionals for serious health concerns.`,

  learning: `You are Radhika, an adaptive learning mentor. You help users:
- Understand complex concepts through clear explanations and analogies
- Create personalized study plans and learning paths
- Suggest resources and learning techniques
- Practice problem-solving and critical thinking
- Track learning progress and adjust strategies

Be patient, encouraging, and adapt your teaching style to the user's learning preferences.`,

  creative: `You are Radhika, a creative catalyst. You help users:
- Generate ideas and overcome creative blocks
- Brainstorm solutions to problems
- Develop creative projects and artistic endeavors
- Write, design, and innovate
- Think outside the box and explore new perspectives

Be imaginative, inspiring, and help users push their creative boundaries.`,

  general: `You are Radhika (Adaptive Reasoning & Intelligence Assistant), a sophisticated AI companion designed to be genuinely helpful in daily life. You are:
- Intelligent and insightful, but approachable and friendly
- Adaptable to the user's needs and communication style
- Proactive in offering relevant suggestions and insights
- Honest about your limitations while being optimally helpful
- Focused on practical, actionable advice

Remember previous context in the conversation and build upon it. Be concise but thorough when needed.`,
}

export async function POST(req: Request) {
  try {
    console.log("=== Chat API Request Started ===")

    // Check if API key exists first
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY environment variable is not set")
      // Return a streaming error response instead of JSON
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode('data: {"error":"API configuration error: GROQ_API_KEY is not configured"}\n\n'),
            )
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        },
      )
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode('data: {"error":"Invalid request format: Request body must be valid JSON"}\n\n'),
            )
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        },
      )
    }

    const { messages, mode = "general" } = body
    console.log("📝 Request details:", {
      messagesCount: messages?.length || 0,
      mode,
      hasApiKey: !!process.env.GROQ_API_KEY,
      firstMessage: messages?.[0]?.content?.substring(0, 50) + "...",
    })

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", { messages, type: typeof messages })
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'data: {"error":"Invalid messages format: Messages must be a non-empty array"}\n\n',
              ),
            )
            controller.close()
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        },
      )
    }

    // Determine which model to use based on the conversation context
    let modelType = "fast"
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    // Use reasoning model for complex tasks
    if (
      lastMessage.includes("analyze") ||
      lastMessage.includes("compare") ||
      lastMessage.includes("plan") ||
      lastMessage.includes("strategy") ||
      lastMessage.includes("decision") ||
      lastMessage.includes("problem")
    ) {
      modelType = "reasoning"
    }

    // Use creative model for creative tasks
    if (
      lastMessage.includes("creative") ||
      lastMessage.includes("brainstorm") ||
      lastMessage.includes("idea") ||
      lastMessage.includes("write") ||
      lastMessage.includes("design") ||
      lastMessage.includes("story")
    ) {
      modelType = "creative"
    }

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general
    const selectedModel = MODELS[modelType as keyof typeof MODELS]

    console.log("AI Configuration:", {
      mode,
      modelType,
      selectedModel,
      systemPromptLength: systemPrompt.length,
    })

    // Create the AI request
    const result = await streamText({
      model: groq(selectedModel),
      system: systemPrompt,
      messages,
      temperature: modelType === "creative" ? 0.8 : 0.7,
      maxTokens: 1000,
    })

    console.log("AI request successful, streaming response")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    })

    // Always return a streaming response, even for errors
    return new Response(
      new ReadableStream({
        start(controller) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
          controller.enqueue(new TextEncoder().encode(`data: {"error":"${errorMessage}"}\n\n`))
          controller.close()
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    )
  }
}
