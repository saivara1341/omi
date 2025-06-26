"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Key, Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ApiKeyManagerProps {
  onKeysUpdated?: () => void
}

export function ApiKeyManager({ onKeysUpdated }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState({
    groq: "",
    gemini: "",
    openai: "",
    claude: ""
  })
  
  const [showKeys, setShowKeys] = useState({
    groq: false,
    gemini: false,
    openai: false,
    claude: false
  })
  
  const [saving, setSaving] = useState(false)

  const handleKeyChange = (provider: string, value: string) => {
    setKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev]
    }))
  }

  const saveToEnvFile = async () => {
    setSaving(true)
    
    try {
      // Create the .env content
      const envContent = `# API Keys for SAHITI AI Assistant
# Generated automatically - Do not edit manually

# Required for Groq (free tier available)
GROQ_API_KEY=${keys.groq || 'your_groq_api_key_here'}

# Required for Gemini (free tier available)
GOOGLE_GENERATIVE_AI_API_KEY=${keys.gemini || 'your_gemini_api_key_here'}

# Optional: OpenAI API Key
OPENAI_API_KEY=${keys.openai || 'your_openai_api_key_here'}

# Optional: Claude API Key  
ANTHROPIC_API_KEY=${keys.claude || 'your_claude_api_key_here'}
`

      // Save to .env file via API
      const response = await fetch('/api/save-env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ envContent })
      })

      if (response.ok) {
        // Also save to localStorage for immediate use
        const apiKeys = {
          groq: keys.groq,
          gemini: keys.gemini, 
          openai: keys.openai,
          claude: keys.claude
        }
        localStorage.setItem('apiKeys', JSON.stringify(apiKeys))
        
        toast.success("API keys saved successfully!", {
          description: "Keys have been saved to .env file and are ready to use."
        })
        
        onKeysUpdated?.()
      } else {
        throw new Error('Failed to save to .env file')
      }
    } catch (error) {
      console.error('Error saving API keys:', error)
      toast.error("Failed to save API keys", {
        description: "Please check your keys and try again."
      })
    } finally {
      setSaving(false)
    }
  }

  const keyConfigs = [
    {
      key: 'groq',
      name: 'Groq API Key',
      placeholder: 'gsk_...',
      description: 'Fast inference with Llama models (free tier available)',
      required: true,
      link: 'https://console.groq.com/'
    },
    {
      key: 'gemini', 
      name: 'Google Gemini API Key',
      placeholder: 'AIzaSy...',
      description: 'Google\'s advanced AI (free tier available)',
      required: true,
      link: 'https://makersuite.google.com/app/apikey'
    },
    {
      key: 'openai',
      name: 'OpenAI API Key', 
      placeholder: 'sk-...',
      description: 'GPT-4 and other OpenAI models (paid)',
      required: false,
      link: 'https://platform.openai.com/api-keys'
    },
    {
      key: 'claude',
      name: 'Claude API Key',
      placeholder: 'sk-ant-...',
      description: 'Anthropic\'s helpful assistant (paid)', 
      required: false,
      link: 'https://console.anthropic.com/'
    }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Key Manager
        </CardTitle>
        <CardDescription>
          Enter your API keys below. They will be saved to your .env file and stored securely.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {keyConfigs.map((config, index) => (
          <div key={config.key}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={config.key} className="text-sm font-medium flex items-center gap-2">
                  {config.name}
                  {config.required ? (
                    <span className="text-green-600 dark:text-green-400 text-xs">(Free tier)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-xs">(Paid)</span>
                  )}
                </Label>
                <a 
                  href={config.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-600 hover:text-cyan-500 hover:underline"
                >
                  Get API Key →
                </a>
              </div>
              
              <div className="relative">
                <Input
                  id={config.key}
                  type={showKeys[config.key as keyof typeof showKeys] ? "text" : "password"}
                  placeholder={config.placeholder}
                  value={keys[config.key as keyof typeof keys]}
                  onChange={(e) => handleKeyChange(config.key, e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => toggleShowKey(config.key)}
                >
                  {showKeys[config.key as keyof typeof showKeys] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.description}
              </p>
            </div>
            
            {index < keyConfigs.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        <div className="pt-4">
          <Button 
            onClick={saveToEnvFile} 
            disabled={saving || (!keys.groq && !keys.gemini && !keys.openai && !keys.claude)}
            className="w-full"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving to .env file...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save API Keys to .env File
              </>
            )}
          </Button>
          
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">How this works:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Keys are saved to your .env file automatically</li>
                  <li>• Also stored in browser localStorage for immediate use</li>
                  <li>• Groq and Gemini offer free tiers - no payment required</li>
                  <li>• OpenAI and Claude are optional premium providers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}