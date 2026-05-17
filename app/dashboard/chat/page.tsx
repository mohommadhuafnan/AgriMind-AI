"use client"

import { motion } from "framer-motion"
import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { ChatPromptFromUrl } from "@/components/dashboard/chat-prompt-from-url"
import { ChatVoiceSettings } from "@/components/dashboard/chat/chat-voice-settings"
import { LiveVoiceTextarea } from "@/components/dashboard/voice/live-voice-textarea"
import { VoiceMessageActions } from "@/components/dashboard/voice/voice-message-actions"
import {
  Send,
  Sparkles,
  Loader2,
  Mic,
  MoreVertical,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  Volume2,
  Square,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { prefetchSpeech, preloadVoices, speakText, stopSpeaking } from "@/lib/voice/tts"
import { toast } from "sonner"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  status?: "sending" | "sent" | "error"
  fromVoice?: boolean
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
  const [voiceReplies, setVoiceReplies] = useState(true)
  const [autoSendVoice, setAutoSendVoice] = useState(true)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cancelSpeakRef = useRef<(() => void) | null>(null)

  const { sendMessage, isLoading: isTyping } = useAiChat(language)
  const {
    isListening,
    isTranscribing,
    isPartialTranscribing,
    isLiveTypingSupported,
    isChunkedLiveTyping,
    usesValseaVoice,
    startListening,
    stopListening,
  } = useVoiceInput(language)

  const applySearchPrompt = useCallback((prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }, [])

  const stopVoiceReply = useCallback(() => {
    cancelSpeakRef.current?.()
    stopSpeaking()
    setSpeakingMessageId(null)
  }, [])

  const speakMessage = useCallback(
    (messageId: string, text: string) => {
      if (!text.trim()) return
      stopVoiceReply()
      cancelSpeakRef.current = speakText(text, language, {
        onStart: () => setSpeakingMessageId(messageId),
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      })
    },
    [language, stopVoiceReply]
  )

  useEffect(() => {
    preloadVoices()
  }, [])

  useEffect(() => {
    return () => stopVoiceReply()
  }, [stopVoiceReply])

  const handleLanguageChange = (code: SupportedLanguage) => {
    stopVoiceReply()
    setLanguage(code)
    setMessages([buildWelcomeMessage(code)])
    setInput("")
  }

  const submitMessage = useCallback(
    async (userText: string, options?: { fromVoice?: boolean }) => {
      const trimmed = userText.trim()
      if (!trimmed || isTyping) return

      stopVoiceReply()

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: trimmed,
        timestamp: new Date(),
        status: "sent",
        fromVoice: options?.fromVoice,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      const history: ChatMessageInput[] = messages.map((m) => ({
        role: m.type === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }))

      const reply = await sendMessage(trimmed, history)
      if (!reply) return

      const aiId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiId,
        type: "ai",
        content: reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      if (voiceReplies) {
        prefetchSpeech(reply, language)
        speakMessage(aiId, reply)
      }
    },
    [isTyping, language, messages, sendMessage, speakMessage, stopVoiceReply, voiceReplies]
  )

  const handleMicClick = async () => {
    if (isTyping) return
    if (speakingMessageId) stopVoiceReply()

    if (isListening) {
      const { text, errorShown } = await stopListening()
      const finalText = (text ?? input).trim()
      setInput(finalText)

      if (!finalText && !errorShown) {
        toast.error(
          usesValseaVoice
            ? `No speech detected. Speak in ${getLanguageDisplayLabel(language)}, hold the mic 2+ seconds, then tap again.`
            : "No speech detected. Speak clearly, then tap the mic again."
        )
        return
      }

      if (finalText) {
        if (autoSendVoice) {
          await submitMessage(finalText, { fromVoice: true })
        } else {
          toast.message("Voice message ready — tap Send", { duration: 3000 })
          textareaRef.current?.focus()
        }
      }
      return
    }

    const started = await startListening({
      initialText: input,
      onTextChange: setInput,
    })
    if (!started) return
    textareaRef.current?.focus()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => void submitMessage(input)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    textareaRef.current?.focus()
  }

  const clearChat = () => {
    stopVoiceReply()
    setMessages([buildWelcomeMessage(language)])
  }

  const inputDisabled = isTranscribing || (isTyping && !isListening)
  const micBusy = isTranscribing

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col">
      <Suspense fallback={null}>
        <ChatPromptFromUrl onPrompt={applySearchPrompt} />
      </Suspense>

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
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <Mic className="h-3 w-3" />
              Voice chat
            </Badge>
            {usesValseaVoice && (
              <Badge variant="outline" className="text-xs">
                {getLanguageDisplayLabel(language)} · VALSEA mic
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
          <p className="text-muted-foreground">
            Type or speak — AgriMind replies in text and voice
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <AsianLanguageSelect
            value={language}
            onChange={handleLanguageChange}
            disabled={isTyping || isListening}
            headerSubtitle="Chat, voice input & voice replies"
          />
          {speakingMessageId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 border-red-500/40 text-red-600 dark:text-red-400"
              onClick={stopVoiceReply}
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop voice
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearChat}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
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
                  <motion.div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-primary">AgriMind AI</span>
                  </motion.div>
                )}
                {message.type === "user" && message.fromVoice && (
                  <div className="mb-1 flex items-center gap-1 text-primary-foreground/80">
                    <Mic className="h-3 w-3" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      Voice message
                    </span>
                  </div>
                )}
                <div
                  className={`whitespace-pre-wrap text-sm ${
                    message.type === "user"
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {message.content}
                </div>
                {message.type === "ai" && message.id !== "welcome" && (
                  <VoiceMessageActions
                    content={message.content}
                    isSpeaking={speakingMessageId === message.id}
                    onSpeak={() => speakMessage(message.id, message.content)}
                    onStop={stopVoiceReply}
                  />
                )}
                <div
                  className={`mt-2 flex items-center gap-1 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Clock
                    className={`h-3 w-3 ${
                      message.type === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      message.type === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.type === "user" && message.status === "sent" && (
                    <CheckCircle className="ml-1 h-3 w-3 text-primary-foreground/60" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "AgriMind is thinking..."
                      : `Replying in ${getLanguageDisplayLabel(language)}…`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="mb-2 text-xs text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestionClick(question)}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/80"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border p-4">
          <div className="mb-3">
            <ChatVoiceSettings
              voiceReplies={voiceReplies}
              onVoiceRepliesChange={setVoiceReplies}
              autoSendVoice={autoSendVoice}
              onAutoSendVoiceChange={setAutoSendVoice}
              disabled={isTyping || isListening}
            />
          </div>

          <p className="mb-2 text-center text-xs text-muted-foreground">
            {isListening
              ? usesValseaVoice
                ? "Speak — VALSEA types your message · tap mic again to send"
                : "Speak — tap mic again when finished"
              : voiceReplies
                ? "Tap mic for voice message · AI answers with text and voice"
                : "Tap mic to dictate · enable AI voice replies to hear answers"}
          </p>

          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 ${isListening ? "bg-destructive/10 text-destructive" : ""}`}
              onClick={() => void handleMicClick()}
              disabled={micBusy}
              title={
                isListening
                  ? "Stop recording and send"
                  : "Record voice message"
              }
            >
              {micBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mic className={`h-5 w-5 ${isListening ? "animate-pulse" : ""}`} />
              )}
            </Button>

            <LiveVoiceTextarea
              ref={textareaRef}
              value={input}
              isListening={isListening}
              animateChunked={isChunkedLiveTyping}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
              placeholder={
                isTranscribing
                  ? "Finalizing speech…"
                  : isPartialTranscribing
                    ? "Updating as you speak…"
                    : isListening
                      ? "Speak now — your message appears here…"
                      : language === "en"
                        ? "Type or tap mic to ask about farming…"
                        : `Ask in ${getLanguageDisplayLabel(language)}…`
              }
              rows={1}
              className={`min-h-[48px] max-h-[120px] resize-none ${
                isListening
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : ""
              }`}
            />

            <Button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isTyping || isListening}
              size="icon"
              className="shrink-0"
              title={isListening ? "Send after stopping mic" : "Send message"}
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isListening ? (
                <span className="text-xs font-medium">Send</span>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          {voiceReplies && (
            <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-primary">
              <Volume2 className="h-3 w-3" />
              AI voice replies on
            </p>
          )}

          <p className="mt-2 text-center text-xs text-muted-foreground">
            AgriMind AI can make mistakes. Verify important farming advice with local experts.
          </p>
        </div>
      </Card>
    </div>
  )
}
