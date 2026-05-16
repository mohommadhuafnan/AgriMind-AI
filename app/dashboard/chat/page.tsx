"use client"

import { motion } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Trash2,
  Download,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AsianLanguageSelect } from "@/components/i18n/asian-language-select"
import { useAiChat } from "@/hooks/use-ai-chat"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { getChatWelcomeMessage } from "@/lib/chat/welcome"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import { toast } from "sonner"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  status?: "sending" | "sent" | "error"
}

function buildWelcomeMessage(language: SupportedLanguage): Message {
  return {
    id: "welcome",
    type: "ai",
    content: getChatWelcomeMessage(language),
    timestamp: new Date(),
  }
}

const suggestedQuestions = [
  "How do I treat yellow leaves on tomatoes?",
  "When is the best time to plant rice?",
  "What fertilizer should I use for chili?",
  "How to prevent coconut beetle attack?",
]

export default function ChatPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en")
  const [messages, setMessages] = useState<Message[]>(() => [
    buildWelcomeMessage("en"),
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isLoading: isTyping } = useAiChat(language)
  const {
    isListening,
    isTranscribing,
    isLiveTypingSupported,
    toggleListening,
  } = useVoiceInput(language)

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code)
    setMessages([buildWelcomeMessage(code)])
    setInput("")
  }

  const handleMicClick = async () => {
    if (isTyping) return
    if (isListening) {
      const result = await toggleListening()
      if (result?.text) {
        setInput(result.text)
        textareaRef.current?.focus()
        toast.success("Voice captured — press send or Enter")
      }
    } else {
      await toggleListening({
        initialText: input,
        onTextChange: setInput,
      })
      if (isLiveTypingSupported) {
        toast.message("Listening… words appear as you speak", { duration: 2500 })
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      status: "sent",
    }

    const userText = input.trim()
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const history: ChatMessageInput[] = messages.map((m) => ({
      role: m.type === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }))

    const reply = await sendMessage(userText, history)
    if (!reply) return

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: reply,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    textareaRef.current?.focus()
  }

  const clearChat = () => {
    setMessages([buildWelcomeMessage(language)])
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              OpenAI + VALSEA.ai
            </Badge>
            <Badge variant="outline" className="text-xs">
              15 Asian languages
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
          <p className="text-muted-foreground">
            Your 24/7 farming assistant — replies in the language you choose
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <AsianLanguageSelect
            value={language}
            onChange={handleLanguageChange}
            disabled={isTyping || isListening}
            headerSubtitle="Chat & voice via VALSEA translation"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-muted rounded-tl-md"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary">AgriMind AI</span>
                  </div>
                )}
                <div
                  className={`text-sm whitespace-pre-wrap ${
                    message.type === "user" ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {message.content}
                </div>
                <div className={`flex items-center gap-1 mt-2 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                  <Clock className={`h-3 w-3 ${
                    message.type === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`} />
                  <span className={`text-xs ${
                    message.type === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {message.type === "user" && message.status === "sent" && (
                    <CheckCircle className="h-3 w-3 text-primary-foreground/60 ml-1" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "AgriMind is thinking..."
                      : `Translating to ${getLanguageDisplayLabel(language)}…`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                  className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening… your speech appears here live"
                  : language === "en"
                    ? "Ask anything about farming..."
                    : `Ask in ${getLanguageDisplayLabel(language)} or English…`
              }
              rows={1}
              className={`resize-none min-h-[44px] max-h-[120px] ${
                isListening ? "ring-2 ring-primary/40" : ""
              }`}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 ${isListening ? "text-destructive animate-pulse" : ""}`}
              onClick={handleMicClick}
              disabled={isTranscribing}
              title={
                isListening
                  ? "Stop — finish live typing"
                  : isLiveTypingSupported
                    ? "Speak — live text in box"
                    : "Voice input"
              }
            >
              {isTranscribing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AgriMind AI can make mistakes. Verify important farming advice with local experts.
          </p>
        </div>
      </Card>
    </div>
  )
}
