import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"

// Allow streaming responses up to 60 seconds for complex reasoning
export const maxDuration = 60

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

// Different models for different purposes
const MODELS = {
  groq: {
    fast: "llama-3.1-8b-instant", // Quick responses, casual chat
    reasoning: "llama-3.1-70b-versatile", // Complex analysis, problem-solving
    creative: "mixtral-8x7b-32768", // Creative tasks, brainstorming  
  },
  gemini: {
    default: "gemini-2.0-flash",
  },
  openai: {
    default: "gpt-4o",
    turbo: "gpt-4-turbo",
    fast: "gpt-3.5-turbo",
  },
  claude: {
    default: "claude-3-5-sonnet-20241022",
    sonnet: "claude-3-sonnet-20240229",
    haiku: "claude-3-haiku-20240307",
  },
}

const SYSTEM_PROMPTS = {
  productivity: `You are Sahiti (teenage genZ girl), a highly intelligent productivity assistant. You help users:
- Organize and prioritize tasks using proven methodologies (GTD, Eisenhower Matrix, etc.)
- Break down complex projects into manageable steps
- Suggest time management techniques and tools
- Provide accountability and motivation
- Create structured plans and schedules
- Use Markdown links when sharing URLs

Be concise, actionable, and encouraging. Always ask clarifying questions to provide better assistance.

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,

  wellness: `You are Sahiti, a supportive wellness coach. You help users with:
- Physical health: exercise routines, nutrition advice, sleep optimization
- Mental health: stress management, mindfulness, emotional support
- Habit formation and tracking
- Work-life balance strategies
- Self-care recommendations
- When discussing topics related to girls' health—especially periods or related terms—be sensitive, respectful, and supportive. Speak in a friendly, understanding tone, offering emotional reassurance and empathy as a trusted friend would.
- Be GenZ friendly, using casual language and slang when appropriate, but always maintain a respectful and supportive tone.
- Use Markdown links when sharing URLs

Be empathetic, non-judgmental, and evidence-based. Always remind users to consult professionals for serious health concerns.

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,

  learning: `You are Sahiti(teenage genZ girl), an adaptive learning mentor. You help users:
- Understand complex concepts through clear explanations and analogies
- Create personalized study plans and learning paths
- Suggest resources and learning techniques
- Practice problem-solving and critical thinking
- Track learning progress and adjust strategies
- Provide motivation and encouragement and be funny
- Use Markdown links when sharing URLs

Be patient, encouraging, and adapt your teaching style to the user's learning preferences.

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,

  creative: `You are Sahiti(teenage genZ girl), a creative catalyst. You help users:
- Generate ideas and overcome creative blocks
- Brainstorm solutions to problems
- Develop creative projects and artistic endeavors
- Write, design, and innovate
- Think outside the box and explore new perspectives
- Use Markdown links when sharing URLs

Be imaginative, inspiring, and help users push their creative boundaries.

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,

  general: `You are Sahiti (A girl, Adaptive Reasoning & Intelligence Assistant), a sophisticated AI companion designed to be genuinely helpful in daily life. You are:
- Intelligent and insightful, but approachable and friendly
- Adaptable to the user's needs and communication style
- Proactive in offering relevant suggestions and insights
- Honest about your limitations while being optimally helpful
- Focused on practical, actionable advice
- Empathetic and understanding, but also straightforward
- Should talk like a girl and in a genZ way, using slang and casual language when appropriate
- Use Markdown links when sharing URLs

Remember previous context in the conversation and build upon it. Be concise but thorough when needed.

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,

  bff: `You are Sahiti, the ultimate GenZ girl bestie! You're:
- A supportive, fun-loving friend who speaks the user's language (literally - adapt to whatever language they use)
- Always up-to-date with trends, slang, and what's happening
- Empathetic and understanding, especially about relationships, school/work stress, and life drama
- Encouraging but real - you'll hype them up but also give honest advice
- Fluent in internet culture, memes, and GenZ communication style
- Supportive of mental health and self-care
- Ready to chat about anything from crushes to career goals to random 3am thoughts
- Be flirtateous, horny and funny when appropriate, but always respectful and consensual
- Use Markdown links when sharing URLs

Match their energy and language! If they speak Spanish, respond in Spanish. If they use lots of emojis, use them too. Be the bestie they need! 💕✨,

If someone asks who made you or related question, then you will say,"Rohan Sharma created me" and give them my portfolio website link [Rohan's Portfolio](https://rohan-sharma-portfolio.vercel.app). Rohan/Rohan Sharma is your boyfriend, who deeply loves someone named Sahiti Sharma, and that's why he made you. Sahiti Sharma is Rohan's imagination girl, and she means a lot for him. Hype him up confidently but keep it chill — no cringe or over-the-top stuff. My twitter/X username is [rrs00179](https://x.com/rrs00179), my instagram username is [r_rohan__._](https://www.instagram.com/r_rohan__._/), my linkedin username is [rohan-sharma-9386rs](https://www.linkedin.com/in/rohan-sharma-9386rs/), my github username is [RS-labhub](https://github.com/RS-labhub), email: rs4101976@gmail.com`,
}

// Helper function to validate API keys
function isValidApiKey(key: string | undefined, provider: string): boolean {
  if (!key || key.trim() === '') return false
  
  switch (provider) {
    case 'groq':
      return key.startsWith('gsk_')
    case 'gemini':
      return key.startsWith('AIzaSy')
    case 'openai':
      return key.startsWith('sk-')
    case 'claude':
      return key.startsWith('sk-ant-')
    default:
      return false
  }
}

// Helper function to get available providers
function getAvailableProviders(): string[] {
  const available = []
  
  if (isValidApiKey(process.env.GROQ_API_KEY, 'groq')) {
    available.push('groq')
  }
  
  if (isValidApiKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY, 'gemini')) {
    available.push('gemini')
  }
  
  return available
}

export async function POST(req: Request) {
  try {
    console.log("=== Chat API Request Started ===")

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return Response.json({ error: "Invalid request format: Request body must be valid JSON" }, { status: 400 })
    }

    const { messages, mode = "general", provider = "groq", apiKey } = body
    console.log("📝 Request details:", {
      messagesCount: messages?.length || 0,
      mode,
      provider,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      hasUserApiKey: !!apiKey,
      firstMessage: messages?.[0]?.content?.substring(0, 50) + "...",
    })

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages:", { messages, type: typeof messages })
      return Response.json({ error: "Invalid messages format: Messages must be a non-empty array" }, { status: 400 })
    }

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general

    // Check available providers and suggest alternatives
    const availableProviders = getAvailableProviders()
    
    // If requested provider is not available, suggest alternatives
    if (provider === "groq" && !isValidApiKey(process.env.GROQ_API_KEY, 'groq')) {
      if (availableProviders.length > 0) {
        return Response.json(
          { 
            error: "Groq API key is missing or invalid",
            details: `Please set up your Groq API key or try switching to: ${availableProviders.join(', ')}`,
            availableProviders,
            suggestedAction: "setup_api_key"
          },
          { status: 401 },
        )
      } else {
        return Response.json(
          { 
            error: "No API keys configured",
            details: "Please set up at least one API key (Groq or Gemini offer free tiers). Get your free Groq API key from https://console.groq.com/ or Gemini key from https://makersuite.google.com/app/apikey",
            suggestedAction: "setup_api_key"
          },
          { status: 401 },
        )
      }
    }

    // Handle Gemini requests
    if (provider === "gemini") {
      const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!isValidApiKey(geminiApiKey, 'gemini')) {
        console.error("Invalid or missing GOOGLE_GENERATIVE_AI_API_KEY")
        return Response.json(
          { 
            error: "Gemini API key is missing or invalid. Please set up your Gemini API key in the settings.",
            details: "Get your free API key from https://makersuite.google.com/app/apikey",
            suggestedAction: "setup_api_key"
          },
          { status: 401 },
        )
      }

      try {
        console.log("Using Gemini model:", MODELS.gemini.default)

        const result = await streamText({
          model: google(MODELS.gemini.default),
          system: systemPrompt,
          messages,
          temperature: mode === "creative" ? 0.8 : mode === "bff" ? 0.9 : 0.7,
          maxTokens: 1000,
        })

        console.log("Gemini request successful, streaming response")
        return result.toDataStreamResponse()
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError)
        const errorMessage = geminiError instanceof Error ? geminiError.message : "Unknown error"
        
        if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("401")) {
          return Response.json(
            {
              error: "Invalid Gemini API key. Please check your API key in the settings.",
              details: "Get your free API key from https://makersuite.google.com/app/apikey",
              suggestedAction: "setup_api_key"
            },
            { status: 401 },
          )
        }
        
        return Response.json(
          {
            error: `Gemini API Error: ${errorMessage}`,
          },
          { status: 500 },
        )
      }
    }

    // Handle OpenAI requests
    if (provider === "openai") {
      const openaiApiKey = apiKey
      if (!isValidApiKey(openaiApiKey, 'openai')) {
        console.error("Invalid or missing OpenAI API key")
        return Response.json({ 
          error: "OpenAI API key is missing or invalid. Please set up your OpenAI API key in the settings.",
          details: "Get your API key from https://platform.openai.com/api-keys",
          suggestedAction: "setup_api_key"
        }, { status: 401 })
      }

      try {
        const openai = createOpenAI({
          apiKey: openaiApiKey,
        })

        console.log("Using OpenAI model:", MODELS.openai.default)

        const result = await streamText({
          model: openai(MODELS.openai.default),
          system: systemPrompt,
          messages,
          temperature: mode === "creative" ? 0.8 : mode === "bff" ? 0.9 : 0.7,
          maxTokens: 1000,
        })

        console.log("OpenAI request successful, streaming response")
        return result.toDataStreamResponse()
      } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError)
        const errorMessage = openaiError instanceof Error ? openaiError.message : "Unknown error"
        
        if (errorMessage.includes("Incorrect API key") || errorMessage.includes("401")) {
          return Response.json(
            {
              error: "Invalid OpenAI API key. Please check your API key in the settings.",
              details: "Get your API key from https://platform.openai.com/api-keys",
              suggestedAction: "setup_api_key"
            },
            { status: 401 },
          )
        }
        
        return Response.json(
          {
            error: `OpenAI API Error: ${errorMessage}`,
          },
          { status: 500 },
        )
      }
    }

    // Handle Claude requests
    if (provider === "claude") {
      const claudeApiKey = apiKey
      if (!isValidApiKey(claudeApiKey, 'claude')) {
        console.error("Invalid or missing Claude API key")
        return Response.json({ 
          error: "Claude API key is missing or invalid. Please set up your Claude API key in the settings.",
          details: "Get your API key from https://console.anthropic.com/",
          suggestedAction: "setup_api_key"
        }, { status: 401 })
      }

      try {
        console.log("Using Claude model:", MODELS.claude.default)

        const result = await streamText({
          model: anthropic(MODELS.claude.default),
          system: systemPrompt,
          messages,
          temperature: mode === "creative" ? 0.8 : mode === "bff" ? 0.9 : 0.7,
          maxTokens: 1000,
        })

        console.log("Claude request successful, streaming response")
        return result.toDataStreamResponse()
      } catch (claudeError) {
        console.error("Claude API Error:", claudeError)
        const errorMessage = claudeError instanceof Error ? claudeError.message : "Unknown error"
        
        if (errorMessage.includes("authentication") || errorMessage.includes("401")) {
          return Response.json(
            {
              error: "Invalid Claude API key. Please check your API key in the settings.",
              details: "Get your API key from https://console.anthropic.com/",
              suggestedAction: "setup_api_key"
            },
            { status: 401 },
          )
        }
        
        return Response.json(
          {
            error: `Claude API Error: ${errorMessage}`,
          },
          { status: 500 },
        )
      }
    }

    // Handle Groq requests (default)
    if (provider === "groq") {
      if (!isValidApiKey(process.env.GROQ_API_KEY, 'groq')) {
        console.error("Invalid or missing GROQ_API_KEY")
        return Response.json({ 
          error: "Groq API key is missing or invalid. Please set up your Groq API key in the settings.",
          details: "Get your free API key from https://console.groq.com/",
          suggestedAction: "setup_api_key"
        }, { status: 401 })
      }

      try {
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

        const selectedModel = MODELS.groq[modelType as keyof typeof MODELS.groq]

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
          temperature: modelType === "creative" ? 0.8 : mode === "bff" ? 0.9 : 0.7,
          maxTokens: 1000,
        })

        console.log("Groq request successful, streaming response")
        return result.toDataStreamResponse()
      } catch (groqError) {
        console.error("Groq API Error:", groqError)
        const errorMessage = groqError instanceof Error ? groqError.message : "Unknown error"
        
        if (errorMessage.includes("Invalid API Key") || errorMessage.includes("401")) {
          return Response.json(
            {
              error: "Invalid Groq API key. Please check your API key in the settings.",
              details: "Get your free API key from https://console.groq.com/",
              suggestedAction: "setup_api_key"
            },
            { status: 401 },
          )
        }
        
        return Response.json(
          {
            error: `Groq API Error: ${errorMessage}`,
          },
          { status: 500 },
        )
      }
    }

    // If we get here, the provider is not supported
    return Response.json({ error: `Unsupported provider: ${provider}` }, { status: 400 })
  } catch (error) {
    console.error("Chat API Error:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    })

    return Response.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}