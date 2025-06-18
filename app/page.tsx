"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Brain,
  Heart,
  BookOpen,
  Lightbulb,
  User,
  Target,
  MessageCircle,
  Trash2,
  Mic,
  MicOff,
  ArrowUp,
  Sparkles,
  Github,
  Menu,
  X,
  Volume2,
  VolumeX,
  Users,
  Sun,
  Moon,
  Cpu,
  AlertCircle,
  ChevronDown,
  Key,
  Check,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { AIVisualization } from "@/components/ai-visualization"
import { ActivityMatrix } from "@/components/activity-matrix"
import { useSpeech } from "@/hooks/use-speech"

type Mode = "general" | "productivity" | "wellness" | "learning" | "creative" | "bff"
type Provider = "groq" | "gemini" | "openai" | "claude"

const MODES = {
  general: {
    icon: Brain,
    label: "General",
    description: "General assistance and conversation",
    placeholder: "Ask me anything...",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-100/50 dark:bg-cyan-950/30",
    border: "border-cyan-300 dark:border-cyan-500/30",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  productivity: {
    icon: Target,
    label: "Productivity",
    description: "Task management and organization",
    placeholder: "How can I help you be more productive?",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100/50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  wellness: {
    icon: Heart,
    label: "Wellness",
    description: "Health and well-being guidance",
    placeholder: "What wellness topic can I help with?",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100/50 dark:bg-rose-950/30",
    border: "border-rose-300 dark:border-rose-500/30",
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
  learning: {
    icon: BookOpen,
    label: "Learning",
    description: "Education and skill development",
    placeholder: "What would you like to learn?",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100/50 dark:bg-purple-950/30",
    border: "border-purple-300 dark:border-purple-500/30",
    gradient: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-500/20",
  },
  creative: {
    icon: Lightbulb,
    label: "Creative",
    description: "Ideas and creative projects",
    placeholder: "Let's brainstorm something creative...",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100/50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-500/30",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  bff: {
    icon: Users,
    label: "BFF",
    description: "Your GenZ bestie who speaks your language",
    placeholder: "Hey bestie, what's up? 💕",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-100/50 dark:bg-pink-950/30",
    border: "border-pink-300 dark:border-pink-500/30",
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
  },
}

const PROVIDERS = {
  groq: {
    name: "Groq",
    description: "Fast and efficient LLM",
    models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile"],
    requiresApiKey: false,
    color: "cyan",
  },
  gemini: {
    name: "Gemini",
    description: "Google's multimodal AI",
    models: ["gemini-2.0-flash"],
    requiresApiKey: false,
    color: "emerald",
  },
  openai: {
    name: "OpenAI",
    description: "Advanced language models",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresApiKey: true,
    color: "violet",
  },
  claude: {
    name: "Claude",
    description: "Anthropic's helpful assistant",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    requiresApiKey: true,
    color: "orange",
  },
}

const QUICK_ACTIONS = {
  general: [
    "Help me make a decision",
    "Explain a complex topic",
    "Provide advice on a situation",
    "Solve a problem step by step",
  ],
  productivity: ["Plan my day effectively", "Break down a project", "Prioritize my tasks", "Time management tips"],
  wellness: ["Morning routine ideas", "Stress management techniques", "Healthy habit suggestions", "Workout planning"],
  learning: ["Explain a concept", "Create a study plan", "Learning resources", "Practice exercises"],
  creative: ["Brainstorm ideas", "Creative writing prompts", "Project inspiration", "Overcome creative blocks"],
  bff: ["What's the tea? ☕", "I need some motivation 💪", "Help me with drama 🎭", "Let's chat about life 💫"],
}

import type { Components } from "react-markdown"

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

export default function FuturisticRadhika() {
  const [mode, setMode] = useState<Mode>("general")
  const [provider, setProvider] = useState<Provider>("groq")
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider>("groq")
  const [tempApiKey, setTempApiKey] = useState("")
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false)

  // Use the speech hook
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

  // Stable API keys state
  const [apiKeys, setApiKeys] = useState(() => ({
    openai: "",
    claude: "",
  }))

  // Separate message states for each mode - use ref to avoid dependency issues
  const messagesByModeRef = useRef<Record<Mode, any[]>>({
    general: [],
    productivity: [],
    wellness: [],
    learning: [],
    creative: [],
    bff: [],
  })

  // Current mode ref to avoid stale closures
  const currentModeRef = useRef<Mode>(mode)
  currentModeRef.current = mode

  // Memoize the current API key to prevent unnecessary re-renders
  const currentApiKey = useMemo(() => {
    if (!PROVIDERS[provider].requiresApiKey) return ""
    return provider === "openai" ? apiKeys.openai : provider === "claude" ? apiKeys.claude : ""
  }, [provider, apiKeys])

  // Stable chat configuration - memoized to prevent infinite loops
  const chatConfig = useMemo(
    () => ({
      api: "/api/chat",
      experimental_throttle: 50, // Throttle UI updates to prevent infinite loops
      body: {
        mode,
        provider,
        ...(PROVIDERS[provider].requiresApiKey && provider === "openai" && apiKeys.openai
          ? { apiKey: apiKeys.openai }
          : provider === "claude" && apiKeys.claude
            ? { apiKey: apiKeys.claude }
            : {}),
      },
    }),
    [mode, provider, apiKeys.openai, apiKeys.claude, voiceEnabled, speakMessage],
  )

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat(chatConfig)

  // Update messages by mode when messages change - use useCallback to prevent infinite loops
  const updateMessagesByMode = useCallback(() => {
    if (messages.length > 0) {
      messagesByModeRef.current[currentModeRef.current] = [...messages]
    }
  }, [messages])

  useEffect(() => {
    updateMessagesByMode()
  }, [updateMessagesByMode])

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Load API keys from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedApiKeys = localStorage.getItem("radhika-api-keys")
      if (savedApiKeys) {
        try {
          const parsedKeys = JSON.parse(savedApiKeys)
          setApiKeys(parsedKeys)
        } catch (e) {
          console.error("Failed to parse saved API keys:", e)
        }
      }
    }
  }, [])

  // Combine errors
  const combinedError = error || speechError

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleQuickAction = useCallback(
    (action: string) => {
      setInput(action)
      setError(null)
      clearSpeechError()
    },
    [setInput, clearSpeechError],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    messagesByModeRef.current[currentModeRef.current] = []
    setError(null)
    clearSpeechError()
    stopSpeaking()
  }, [setMessages, clearSpeechError, stopSpeaking])

  const handleVoiceInput = useCallback(() => {
    startListening((transcript: string) => {
      setInput(transcript)
    })
  }, [startListening, setInput])

  // Handle mode change - load messages for the new mode
  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (newMode === mode) return // Don't update if mode hasn't changed

      // Save current messages to current mode
      messagesByModeRef.current[currentModeRef.current] = [...messages]

      // Switch to new mode
      setMode(newMode)
      setError(null)
      clearSpeechError()
      setIsMobileMenuOpen(false)

      // Set messages for new mode
      const newModeMessages = messagesByModeRef.current[newMode] || []
      setMessages(newModeMessages)
    },
    [messages, setMessages, mode, clearSpeechError],
  )

  // Handle provider change
  const handleProviderChange = useCallback(
    (newProvider: Provider) => {
      // Close the provider menu
      setIsProviderMenuOpen(false)

      // Check if API key is required and available
      if (PROVIDERS[newProvider].requiresApiKey) {
        const hasApiKey = newProvider === "openai" ? apiKeys.openai : newProvider === "claude" ? apiKeys.claude : false
        if (!hasApiKey) {
          setSelectedProvider(newProvider)
          setTempApiKey("")
          setIsApiKeyDialogOpen(true)
          return
        }
      }

      setProvider(newProvider)
      setError(null)
      clearSpeechError()
    },
    [apiKeys, clearSpeechError],
  )

  // Handle API key save
  const handleSaveApiKey = useCallback(() => {
    if (!tempApiKey.trim()) {
      setIsApiKeyDialogOpen(false)
      return
    }

    // Update API keys
    const updatedApiKeys = {
      ...apiKeys,
      [selectedProvider]: tempApiKey.trim(),
    }
    setApiKeys(updatedApiKeys)

    // Save API keys to localStorage
    localStorage.setItem("radhika-api-keys", JSON.stringify(updatedApiKeys))

    // Switch to the selected provider
    setProvider(selectedProvider)
    setError(null)
    clearSpeechError()
    setIsApiKeyDialogOpen(false)
    setTempApiKey("")
  }, [apiKeys, selectedProvider, tempApiKey, clearSpeechError])

  const currentMode = useMemo(() => MODES[mode], [mode])
  const CurrentModeIcon = currentMode.icon

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }, [])

  // Close provider menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isProviderMenuOpen && !target.closest('[data-provider-menu="true"]')) {
        setIsProviderMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProviderMenuOpen])

  // Handle chat errors
  const handleChatError = useCallback(
    (error: Error) => {
      console.error("Chat error details:", error)
      const errorMessage = error.message || "Failed to send message. Please try again."
      setError(errorMessage)

      // If it's an API key error, suggest setting up the API key
      if (errorMessage.includes("API configuration error") || errorMessage.includes("API key")) {
        setError(`${errorMessage} Please set up your ${PROVIDERS[provider].name} API key.`)
      }
    },
    [provider],
  )

  // Handle chat finish
  const handleChatFinish = useCallback(
    (message: any) => {
      setError(null)
      if (voiceEnabled && message.content) {
        speakMessage(message.content)
      }
    },
    [voiceEnabled, speakMessage],
  )

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex h-full">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
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
                className={`w-12 h-12 bg-gradient-to-br ${currentMode.gradient} rounded-2xl flex items-center justify-center shadow-lg ${currentMode.glow} shadow-2xl transform transition-all duration-300 hover:scale-105`}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  RADHIKA
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
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
              Modes
            </h3>
            <div className="space-y-1">
              {Object.entries(MODES).map(([key, modeData]) => {
                const ModeIcon = modeData.icon
                const isActive = mode === key
                const modeMessages = messagesByModeRef.current[key as Mode]?.length || 0
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
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header - Fixed */}
          <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-cyan-500/20 px-3 sm:px-6 py-2 sm:py-4">
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
                {/* Theme Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 p-1"
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
                >
                  {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-800 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors p-2"
                  asChild
                >
                  <a
                    href="https://github.com/RS-labhub/radhika"
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
          {combinedError && (
            <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-3 sm:px-6 py-2">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">{combinedError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null)
                    clearSpeechError()
                  }}
                  className="ml-auto text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Messages - Scrollable */}
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
                        <span className="text-xs text-gray-700 dark:text-gray-400">Radhika is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-cyan-500/20 p-2 sm:p-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={currentMode.placeholder}
                  className="min-h-[50px] sm:min-h-[60px] max-h-32 resize-none bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 focus:border-cyan-500/50 focus:ring-0 pr-20 sm:pr-24 text-base sm:text-lg leading-relaxed"
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
                                  <Key className="w-3 h-3 text-gray-400" />
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

        {/* Right Sidebar - Activity Matrix */}
        <div className="hidden xl:flex w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-cyan-500/20 flex-col">
          <div className="p-6">
            <ActivityMatrix messages={messages} currentMode={mode} />
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              Enter {PROVIDERS[selectedProvider]?.name} API Key
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              To use {PROVIDERS[selectedProvider]?.name}, please enter your API key. It will be stored securely in your
              browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {PROVIDERS[selectedProvider]?.name} API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder={`Enter your ${PROVIDERS[selectedProvider]?.name} API key`}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSaveApiKey()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApiKeyDialogOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Save & Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-400 {
          scrollbar-color: #9ca3af transparent;
        }
        .dark .scrollbar-thumb-gray-500 {
          scrollbar-color: #6b7280 transparent;
        }
        .scrollbar-track-transparent {
          scrollbar-track-color: transparent;
        }
        
        /* Webkit scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px;
          height: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #9ca3af;
          border-radius: 1px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #6b7280;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  )
}
