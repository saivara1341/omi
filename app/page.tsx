"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Heart,
  BookOpen,
  Lightbulb,
  User,
  Target,
  Moon,
  Sun,
  MessageCircle,
  Trash2,
  Mic,
  MicOff,
  ArrowUp,
  Sparkles,
  Github,
  Menu,
  X,
} from "lucide-react"
import ReactMarkdown from "react-markdown"

type Mode = "general" | "productivity" | "wellness" | "learning" | "creative"

const MODES = {
  general: {
    icon: Brain,
    label: "General",
    description: "General assistance and conversation",
    placeholder: "Ask me anything...",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  productivity: {
    icon: Target,
    label: "Productivity",
    description: "Task management and organization",
    placeholder: "How can I help you be more productive?",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  wellness: {
    icon: Heart,
    label: "Wellness",
    description: "Health and well-being guidance",
    placeholder: "What wellness topic can I help with?",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  learning: {
    icon: BookOpen,
    label: "Learning",
    description: "Education and skill development",
    placeholder: "What would you like to learn?",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  creative: {
    icon: Lightbulb,
    label: "Creative",
    description: "Ideas and creative projects",
    placeholder: "Let's brainstorm something creative...",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
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
}

import type { Components } from "react-markdown"

const MarkdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">{children}</h3>,
  p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
  code: ({ children, className }) => {
    const isInline = !className?.includes("language-")
    return isInline ? (
      <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
        {children}
      </code>
    ) : (
      <code className="block bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm font-mono overflow-x-auto text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-3 overflow-x-auto border border-gray-200 dark:border-gray-700">
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-3 text-gray-600 dark:text-gray-400"
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
    >
      {children}
    </a>
  ),
}

export default function AriaAssistant() {
  const [mode, setMode] = useState<Mode>("general")
  const [darkMode, setDarkMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat({
    api: "/api/chat",
    body: { mode },
    onError: (error) => {
      console.error("Chat error details:", error)
      setError(error.message || "Failed to send message. Please try again.")
    },
    onFinish: () => {
      setError(null)
    },
  })

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [setInput])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    setMessages([])
    setError(null)
  }, [mode, setMessages])

  const handleQuickAction = useCallback(
    (action: string) => {
      setInput(action)
      setError(null)
    },
    [setInput],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [setMessages])

  const handleVoiceInput = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition is not supported in your browser.")
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
      setIsListening(true)
    }
  }, [recognition, isListening])

  const currentMode = useMemo(() => MODES[mode], [mode])
  const CurrentModeIcon = currentMode.icon

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }, [])

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-950" : "bg-gray-50"} transition-colors duration-200`}>
      <div className="flex h-screen">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
  fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out
  ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-l from-indigo-700 via-blue-700 to-blue-600 bg-clip-text text-transparent">
                  RADHIKA
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI Assistant</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-gray-600 dark:text-gray-400"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Mode Selector */}
          <div className="p-4">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
              Modes
            </h3>
            <div className="space-y-1">
              {Object.entries(MODES).map(([key, modeData]) => {
                const ModeIcon = modeData.icon
                const isActive = mode === key
                return (
                  <button
                    key={key}
                    onClick={() => setMode(key as Mode)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? `${modeData.bg} ${modeData.color} ${modeData.border} border`
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <ModeIcon className="w-4 h-4" />
                    <span>{modeData.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-800" />

          {/* Quick Actions */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {QUICK_ACTIONS[mode].map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <div className={`p-1.5 sm:p-2 rounded-lg ${currentMode.bg} ${currentMode.border} border flex-shrink-0`}>
                  <CurrentModeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentMode.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {currentMode.label} Assistant
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate hidden sm:block">
                    {currentMode.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hidden sm:inline-flex"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  {messages.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
              {messages.length === 0 && (
                <>
                  <div className="text-center py-8 sm:py-12">
                    <div
                      className={`inline-flex p-3 sm:p-4 rounded-2xl ${currentMode.bg} ${currentMode.border} border mb-4 sm:mb-6`}
                    >
                      <CurrentModeIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${currentMode.color}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      What can I help you {mode === "general" ? "with" : `${mode === "creative" ? "create" : mode}`}?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                      I'm your {currentMode.label.toLowerCase()} assistant. Ask me anything or use the quick actions to
                      get started. <br />
                      <br />
                      Use keywords 'analyze', 'explain', 'compare', 'plan', 'strategy', 'decision', 'problem',
                      'creative', 'brainstorm', 'idea', 'write', 'design', 'story' to guide me in the right direction.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {QUICK_ACTIONS[mode].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className="px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-2 sm:space-x-4 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div
                        className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center`}
                      >
                        <CurrentModeIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${currentMode.color}`} />
                      </div>
                    )}
                    <div
                      className={`flex-1 max-w-[85%] sm:max-w-3xl ${message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}`}
                    >
                      <div
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${message.role === "user"
                            ? "bg-blue-600 text-white max-w-full"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
                          }`}
                      >
                        {message.role === "user" ? (
                          <div className="text-sm break-words">{message.content}</div>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-invert">
                            <ReactMarkdown components={MarkdownComponents}>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-xs text-gray-500 mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                      >
                        {formatTime(message.createdAt ? new Date(message.createdAt).getTime() : Date.now())}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex space-x-2 sm:space-x-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${currentMode.bg} ${currentMode.border} border flex items-center justify-center`}
                    >
                      <CurrentModeIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${currentMode.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Radhika is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={currentMode.placeholder}
                  className="min-h-[50px] sm:min-h-[60px] max-h-32 resize-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 pr-20 sm:pr-24 text-sm sm:text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e as any)
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-1 sm:space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-1.5 sm:p-2 ${isListening
                      ? "bg-red-100 text-red-600 border-red-300 hover:bg-red-200 dark:bg-red-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2"
                  >
                    <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
                <span className="sm:hidden">Tap to send</span>
                <span className={`${currentMode.color} font-medium`}>{currentMode.label} mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
