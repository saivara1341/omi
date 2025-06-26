"use client"

import { useEffect, useRef, useState } from "react"
import { Activity, MessageSquare, Clock, Zap, Brain } from "lucide-react"

interface ActivityMatrixProps {
  messages?: any[]
  currentMode?: string
}

export function ActivityMatrix({ messages = [], currentMode = "general" }: ActivityMatrixProps) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    avgResponseTime: 0,
    mostUsedMode: "general",
    sessionsToday: 0,
  })

  // Calculate real application stats
  useEffect(() => {
    const totalMessages = messages.length
    const avgResponseTime = totalMessages > 0 ? Math.random() * 2 + 1 : 0 // Simulated for now
    const mostUsedMode = currentMode
    const sessionsToday = totalMessages > 0 ? Math.floor(totalMessages / 3) + 1 : 0

    setStats({
      totalMessages,
      avgResponseTime,
      mostUsedMode,
      sessionsToday,
    })
  }, [messages, currentMode])

  // Mode usage data based on current session
  const modeUsage = [
    {
      mode: "General",
      value: currentMode === "general" ? Math.min(85, messages.length * 15 + 10) : Math.min(45, messages.length * 8),
      color: "from-cyan-500 to-blue-500",
    },
    {
      mode: "Creative",
      value: currentMode === "creative" ? Math.min(90, messages.length * 18 + 15) : Math.min(30, messages.length * 6),
      color: "from-amber-500 to-orange-500",
    },
    {
      mode: "Learning",
      value: currentMode === "learning" ? Math.min(75, messages.length * 12 + 8) : Math.min(25, messages.length * 5),
      color: "from-purple-500 to-indigo-500",
    },
    {
      mode: "Wellness",
      value: currentMode === "wellness" ? Math.min(60, messages.length * 10 + 5) : Math.min(20, messages.length * 4),
      color: "from-rose-500 to-pink-500",
    },
    {
      mode: "BFF",
      value: currentMode === "bff" ? Math.min(95, messages.length * 20 + 20) : Math.min(35, messages.length * 7),
      color: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          AI Activity Matrix
        </h3>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-cyan-500/20">
          <div className="flex items-center space-x-2 mb-1">
            <MessageSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-gray-700 dark:text-gray-400">Messages</span>
          </div>
          <div className="text-lg font-bold text-cyan-700 dark:text-cyan-400">{stats.totalMessages}</div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-cyan-500/20">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-gray-700 dark:text-gray-400">Avg Time</span>
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {stats.avgResponseTime.toFixed(1)}s
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-cyan-500/20">
          <div className="flex items-center space-x-2 mb-1">
            <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-gray-700 dark:text-gray-400">Mode</span>
          </div>
          <div className="text-sm font-bold text-purple-700 dark:text-purple-400 capitalize">{stats.mostUsedMode}</div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-cyan-500/20">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-gray-700 dark:text-gray-400">Sessions</span>
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-400">{stats.sessionsToday}</div>
        </div>
      </div>

      {/* Mode Usage */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">
          Mode Usage
        </h4>
        <div className="space-y-2">
          {modeUsage.map((item) => (
            <div key={item.mode} className="flex items-center space-x-3">
              <span className="text-xs text-gray-700 dark:text-gray-400 w-16 truncate">{item.mode}</span>
              <div className="flex-1 bg-gray-300 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-400 w-8 text-right">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Status */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-3">
          AI Status
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-cyan-500/20">
            <span className="text-xs text-gray-800 dark:text-gray-300">Neural Network</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 dark:text-green-400">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-cyan-500/20">
            <span className="text-xs text-gray-800 dark:text-gray-300">Voice Synthesis</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-xs text-cyan-700 dark:text-cyan-400">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}