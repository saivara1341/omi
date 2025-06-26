"use client"

import { useChat } from "@ai-sdk/react"
import { useCallback, useMemo, useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { useSpeech } from "@/hooks/use-speech"
import { ActivityMatrix } from "@/components/activity-matrix"
import { AIVisualization } from "@/components/ai-visualization"
import { ButterflyIcon } from "@/components/butterfly-icon"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import {
  Brain,
  Target,
  Heart,
  BookOpen,
  Lightbulb,
  Sparkles,
  User,
  Mic,
  MicOff,
  ArrowUp,
  VolumeX,
  Cpu,
  ChevronDown,
  Key,
  Check,
  Sun,
  Moon,
  MessageCircle,
  Volume2,
  VolumeX as VolumeOff,
  Trash2,
  Github,
  AlertCircle,
  X,
  Menu,
} from "lucide-react"

type Mode = "general" | "productivity" | "wellness" | "learning" | "creative" | "bff"
type Provider = "groq" | "gemini" | "openai" | "claude"

const MarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-base lg:text-lg font-semibold mb-2 lg:mb-3 text-gray-900 dark:text-gray-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm lg:text-base font-semibold mb-1.5 lg:mb-2 text-gray-900 dark:text-gray-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xs lg:text-sm font-semibold mb-1.5 lg:mb-2 text-gray-900 dark:text-gray-100">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 lg:mb-3 last:mb-0 text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-2 lg:mb-3 space-y-1 text-sm lg:text-base text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-2 lg:mb-3 space-y-1 text-sm lg:text-base text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-sm lg:text-base text-gray-700 dark:text-gray-300">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
  code: ({ children, className }) => {
    const isInline = !className?.includes("language-")
    return isInline ? (
      <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs lg:text-sm font-mono text-cyan-700 dark:text-cyan-400 border border-gray-300 dark:border-gray-700">
        {children}
      </code>
    ) : (
      <code className="block bg-gray-200 dark:bg-gray-900 p-2 lg:p-3 rounded-lg text-xs lg:text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-gray-200 dark:bg-gray-900 p-2 lg:p-3 rounded-lg mb-2 lg:mb-3 overflow-x-auto border border-gray-300 dark:border-gray-700">
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="border-l-4 border-cyan-500 pl-3 lg:pl-4 italic mb-2 lg:mb-3 text-sm lg:text-base text-gray-600 dark:text-gray-400"
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 underline"
    >
      {children}
    </a>
  ),
}

const MODES = {
  general: {
    label: "General",
    icon: ButterflyIcon,
    description: "All-purpose AI companion for everyday queries",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-100/50 dark:bg-cyan-950/30",
    border: "border-cyan-500/30",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
    placeholder: "Ask me anything! I'm here to help with all your questions and conversations.",
  },
  productivity: {
    label: "Productivity",
    icon: Target,
    description: "Task management and organization expert",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100/50 dark:bg-emerald-950/30",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    placeholder: "Let's boost your productivity! Ask about task management, planning, or time optimization.",
  },
  wellness: {
    label: "Wellness",
    icon: Heart,
    description: "Health and well-being support",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100/50 dark:bg-rose-950/30",
    border: "border-rose-500/30",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
    placeholder: "Your wellness journey starts here. Ask about health, fitness, or mental well-being.",
  },
  learning: {
    label: "Learning",
    icon: BookOpen,
    description: "Educational guidance and skill development",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100/50 dark:bg-purple-950/30",
    border: "border-purple-500/30",
    gradient: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-500/20",
    placeholder: "Ready to learn something new? Ask about any topic or skill you'd like to develop.",
  },
  creative: {
    label: "Creative",
    icon: Lightbulb,
    description: "Brainstorming and creative inspiration",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100/50 dark:bg-amber-950/30",
    border: "border-amber-500/30",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    placeholder: "Let's create something amazing! Share your ideas or ask for creative inspiration.",
  },
  bff: {
    label: "BFF",
    icon: Sparkles,
    description: "Your GenZ bestie for life advice and fun",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-100/50 dark:bg-pink-950/30",
    border: "border-pink-500/30",
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
    placeholder: "Hey bestie! What's on your mind? Let's chat about anything and everything! 💕",
  },
}

const QUICK_ACTIONS = {
  general: [
    "What's the weather like today?",
    "Help me make a decision",
    "Explain a complex topic",
    "Give me some advice",
  ],
  productivity: [
    "Create a daily schedule",
    "Help me prioritize tasks",
    "Suggest productivity techniques",
    "Plan a project timeline",
  ],
  wellness: [
    "Design a workout routine",
    "Suggest healthy meal ideas",
    "Help with stress management",
    "Create a sleep schedule",
  ],
  learning: [
    "Explain a concept simply",
    "Create a study plan",
    "Suggest learning resources",
    "Help with problem-solving",
  ],
  creative: [
    "Brainstorm creative ideas",
    "Help with writer's block",
    "Suggest art projects",
    "Create a story outline",
  ],
  bff: [
    "I need some motivation",
    "Help me with relationship advice",
    "What should I watch/read?",
    "Let's have a fun conversation",
  ],
}

const PROVIDERS = {
  groq: {
    name: "Groq",
    requiresApiKey: false,
    description: "Fast inference with Llama models",
  },
  gemini: {
    name: "Gemini",
    requiresApiKey: false,
    description: "Google's advanced AI",
  },
  openai: {
    name: "OpenAI",
    requiresApiKey: true,
    description: "GPT-4 and other OpenAI models",
  },
  claude: {
    name: "Claude",
    requiresApiKey: true,
    description: "Anthropic's helpful assistant",
  },
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("general")
  const [provider, setProvider] = useState<Provider>("groq")
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [messagesByMode, setMessagesByMode] = useState<Record<Mode, any[]>>({
    general: [],
    productivity: [],
    wellness: [],
    learning: [],
    creative: [],
    bff: [],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentMode = MODES[mode]
  const CurrentModeIcon = currentMode.icon

  // Speech functionality
  const {
    isListening,
    isSpeaking,
    voiceEnabled,
    error: speechError,
    setVoiceEnabled,
    speakMessage,
    stopSpeaking,
    startListening,
    clearError: clearSpeechError,
  } = useSpeech()

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load dark mode preference
      const savedDarkMode = localStorage.getItem("darkMode")
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode))
      }

      // Load voice preference
      const savedVoiceEnabled = localStorage.getItem("voiceEnabled")
      if (savedVoiceEnabled) {
        setVoiceEnabled(JSON.parse(savedVoiceEnabled))
      }

      // Load API keys
      const savedApiKeys = localStorage.getItem("apiKeys")
      if (savedApiKeys) {
        setApiKeys(JSON.parse(savedApiKeys))
      }

      // Load messages for all modes
      const savedMessages: Record<Mode, any[]> = {
        general: [],
        productivity: [],
        wellness: [],
        learning: [],
        creative: [],
        bff: [],
      }

      Object.keys(savedMessages).forEach((modeKey) => {
        const saved = localStorage.getItem(`messages_${modeKey}`)
        if (saved) {
          savedMessages[modeKey as Mode] = JSON.parse(saved)
        }
      })

      setMessagesByMode(savedMessages)
    }
  }, [setVoiceEnabled])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  // Save voice preference
  useEffect(() => {
    localStorage.setItem("voiceEnabled", JSON.stringify(voiceEnabled))
  }, [voiceEnabled])

  // Save API keys
  useEffect(() => {
    localStorage.setItem("apiKeys", JSON.stringify(apiKeys))
  }, [apiKeys])

  // Chat configuration
  const chatConfig = useMemo(
    () => ({
      api: "/api/chat",
      body: {
        mode,
        provider,
        ...(PROVIDERS[provider].requiresApiKey && provider === "openai" && apiKeys.openai
          ? { apiKey: apiKeys.openai }
          : provider === "claude" && apiKeys.claude
            ? { apiKey: apiKeys.claude }
            : {}),
      },
      onError: (error: Error) => {
        console.error("Chat error details:", error)
        const errorMessage = error.message || "Failed to send message. Please try again."
        setError(errorMessage)

        if (errorMessage.includes("API configuration error") || errorMessage.includes("API key")) {
          setError(`${errorMessage} Please set up your ${PROVIDERS[provider].name} API key.`)
        }
      },
    }),
    [mode, provider, apiKeys.openai, apiKeys.claude],
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat(chatConfig)

  // Sync messages with mode-specific storage
  useEffect(() => {
    const currentMessages = messagesByMode[mode]
    if (currentMessages.length !== messages.length) {
      setMessages(currentMessages)
    }
  }, [mode, messagesByMode, messages.length, setMessages])

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      const updatedMessagesByMode = {
        ...messagesByMode,
        [mode]: messages,
      }
      setMessagesByMode(updatedMessagesByMode)
      localStorage.setItem(`messages_${mode}`, JSON.stringify(messages))
    }
  }, [messages, mode, messagesByMode])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle voice synthesis
  const lastMessageRef = useRef<string>("")
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (
        lastMessage.role === "assistant" &&
        lastMessage.content !== lastMessageRef.current &&
        voiceEnabled &&
        !isLoading
      ) {
        lastMessageRef.current = lastMessage.content
        setTimeout(() => {
          speakMessage(lastMessage.content)
        }, 100)
      }
    }
  }, [messages, voiceEnabled, isLoading, speakMessage])

  // Handle voice input
  const handleVoiceInput = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    startListening((transcript: string) => {
      setInput(transcript)
    })
  }, [isSpeaking, stopSpeaking, startListening, setInput])

  // Handle quick actions
  const handleQuickAction = useCallback(
    (action: string) => {
      setInput(action)
    },
    [setInput],
  )

  // Handle mode change
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    setIsMobileMenuOpen(false)
  }, [])

  // Handle provider change
  const handleProviderChange = useCallback((newProvider: Provider) => {
    setProvider(newProvider as Provider)
    setIsProviderMenuOpen(false)
  }, [])

  // Clear chat
  const handleClearChat = useCallback(() => {
    if (window.confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      setMessages([])
      const updatedMessagesByMode = {
        ...messagesByMode,
        [mode]: [],
      }
      setMessagesByMode(updatedMessagesByMode)
      localStorage.removeItem(`messages_${mode}`)
    }
  }, [setMessages, messagesByMode, mode])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
    clearSpeechError()
  }, [clearSpeechError])

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Handle API key setup
  const handleApiKeySetup = (provider: string, apiKey: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: apiKey }))
    toast.success(`${PROVIDERS[provider as Provider].name} API key saved successfully!`)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-cyan-500/20 flex flex-col transform transition-all duration-300 ease-out overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-cyan-500/20">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${currentMode.gradient} rounded-2xl flex items-center justify-center shadow-lg ${currentMode.glow} shadow-2xl transform transition-all duration-300 hover:scale-105 animate-pulse`}
            >
              <Sparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent animate-pulse">
                SAHITI
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Futuristic AI Assistant</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>

        <Separator className="bg-gray-200 dark:bg-cyan-500/20" />

        {/* Mode Selector */}
        <div className="p-4">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Modes</h3>
          <div className="space-y-1">
            {Object.entries(MODES).map(([key, modeData]) => {
              const ModeIcon = modeData.icon
              const isActive = mode === key
              const modeMessages = messagesByMode[key as Mode]?.length || 0
              return (
                <button
                  key={key}
                  onClick={() => handleModeChange(key as Mode)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${modeData.bg} ${modeData.color} ${modeData.border} border shadow-lg ${modeData.glow}`
                      : "text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ModeIcon className="w-4 h-4" />
                    <span>{modeData.label}</span>
                  </div>
                  {modeMessages > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {modeMessages}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <Separator className="bg-gray-200 dark:bg-cyan-500/20" />

        {/* Quick Actions */}
        <div className="p-4 flex-1">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {QUICK_ACTIONS[mode].map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  handleQuickAction(action)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200 dark:bg-cyan-500/20" />

        {/* Activity Matrix */}
        <div className="p-4">
          <ActivityMatrix messages={messages} currentMode={mode} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-cyan-500/20 px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 flex-shrink-0 p-1"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div
                className={`p-1.5 sm:p-2 rounded-lg ${currentMode.bg} ${currentMode.border} border flex-shrink-0 shadow-lg ${currentMode.glow}`}
              >
                <CurrentModeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentMode.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {currentMode.label} Assistant
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate hidden sm:block">
                  {currentMode.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 p-1"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>

              <Badge
                variant="secondary"
                className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-cyan-500/30 hidden sm:inline-flex"
              >
                <MessageCircle className="w-3 h-3 mr-2" />
                {messages.length}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1 transition-colors ${voiceEnabled ? "text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                title={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeOff className="w-3.5 h-3.5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={messages.length === 0}
                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-gray-800 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors p-2"
                asChild
                title="View on GitHub"
              >
                <a
                  href="https://github.com/RS-labhub/sahiti"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || speechError) && (
          <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-3 sm:px-6 py-2">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm flex-1">{error || speechError}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 flex-shrink-0"
                title="Dismiss error"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto px-2 sm:px-6 py-3 sm:py-6">
            {messages.length === 0 && (
              <>
                <div className="text-center py-6 sm:py-10">
                  <div className="mb-8">
                    <AIVisualization mode={mode} isActive={isLoading || isListening} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {mode === "bff"
                      ? "Hey bestie! What's on your mind? 💕"
                      : `What can I help you ${mode === "general" ? "with" : `${mode === "creative" ? "create" : mode}`}?`}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 max-w-md mx-auto px-2 sm:px-4">
                    {mode === "bff"
                      ? "I'm your GenZ bestie who speaks your language! Chat with me in any language and I'll vibe with you! ✨"
                      : `I'm your ${currentMode.label.toLowerCase()} assistant. Ask me anything or use the quick actions to get started.`}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 px-2">
                  {QUICK_ACTIONS[mode].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-300 dark:border-cyan-500/20 hover:border-gray-400 dark:hover:border-cyan-500/40"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-3 sm:space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex space-x-2 sm:space-x-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center shadow-lg ${currentMode.glow}`}
                    >
                      <CurrentModeIcon className={`w-5 h-5 ${currentMode.color}`} />
                    </div>
                  )}
                  <div
                    className={`flex-1 max-w-[80%] sm:max-w-[85%] ${message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        message.role === "user"
                          ? `bg-gradient-to-r ${currentMode.gradient} text-white max-w-full shadow-lg ${currentMode.glow}`
                          : "bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="text-sm break-words">{message.content}</div>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown components={MarkdownComponents}>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs text-gray-600 dark:text-gray-500 mt-0.5 sm:mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                    >
                      {formatTime(message.createdAt ? new Date(message.createdAt).getTime() : Date.now())}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isLoading && (
              <div className="flex space-x-2 sm:space-x-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center shadow-lg ${currentMode.glow}`}
                >
                  <CurrentModeIcon className={`w-5 h-5 ${currentMode.color} animate-pulse`} />
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 px-3 py-2 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-400">Sahiti is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-cyan-500/20 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={currentMode.placeholder}
                className="min-h-[40px] sm:min-h-[50px] max-h-28 resize-none bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 focus:border-cyan-500/50 focus:ring-0 pr-20 sm:pr-24 text-xs sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
              <div className="absolute right-1.5 bottom-1.5 flex items-center space-x-1">
                {isSpeaking && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={stopSpeaking}
                    className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl"
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceInput}
                  className={`rounded-xl p-2 transition-all duration-200 ${
                    isListening
                      ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 animate-pulse"
                      : "text-gray-600 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className={`bg-gradient-to-r ${currentMode.gradient} hover:opacity-90 text-white rounded-xl p-2 shadow-lg ${currentMode.glow} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl`}
                >
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </form>

            {/* Model selector */}
            <div className="flex items-center justify-between mt-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-500">
              <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
              <span className="sm:hidden">Tap to send</span>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className={`${currentMode.color} font-medium`}>{currentMode.label}</span>
                </div>

                <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-700 pl-3">
                  <Cpu className="w-3 h-3 text-gray-600 dark:text-gray-400" />

                  {/* Custom Provider Dropdown */}
                  <div className="relative" data-provider-menu="true">
                    <button
                      onClick={() => setIsProviderMenuOpen(!isProviderMenuOpen)}
                      className="h-6 px-2 text-xs flex items-center gap-1 font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span
                        className={`${
                          provider === "groq"
                            ? "text-cyan-700 dark:text-cyan-400"
                            : provider === "gemini"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : provider === "openai"
                                ? "text-violet-700 dark:text-violet-400"
                                : "text-orange-700 dark:text-orange-400"
                        }`}
                      >
                        {PROVIDERS[provider].name}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isProviderMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        {Object.entries(PROVIDERS).map(([key, providerData]) => (
                          <button
                            key={key}
                            onClick={() => handleProviderChange(key as Provider)}
                            className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <span className={`${key === provider ? "font-medium" : ""}`}>{providerData.name}</span>
                            {key === provider ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              providerData.requiresApiKey &&
                              ((key === "openai" && !apiKeys.openai) || (key === "claude" && !apiKeys.claude)) && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Key className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Setup {providerData.name} API Key</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="apiKey">API Key</Label>
                                        <Input
                                          id="apiKey"
                                          type="password"
                                          placeholder={`Enter your ${providerData.name} API key`}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              const target = e.target as HTMLInputElement
                                              if (target.value.trim()) {
                                                handleApiKeySetup(key, target.value.trim())
                                                target.value = ""
                                              }
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        onClick={(e) => {
                                          const input = (e.target as HTMLElement)
                                            .closest(".space-y-4")
                                            ?.querySelector("input") as HTMLInputElement
                                          if (input?.value.trim()) {
                                            handleApiKeySetup(key, input.value.trim())
                                            input.value = ""
                                          }
                                        }}
                                        className="w-full"
                                      >
                                        Save API Key
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}