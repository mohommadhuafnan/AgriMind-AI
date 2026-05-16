"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  History,
  Trash2,
  Plus,
  Zap,
  Loader2,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useVoiceAssistant,
  type VoiceUiMessage,
} from "@/hooks/use-voice-assistant"
import { useRealtimeSpeechInput } from "@/hooks/use-realtime-speech-input"
import { useVoiceConversations } from "@/hooks/use-voice-conversations"
import { VoiceMicButton } from "@/components/dashboard/voice/voice-mic-button"
import { VoiceMessageActions } from "@/components/dashboard/voice/voice-message-actions"
import { VoiceLanguageSelect } from "@/components/dashboard/voice/voice-language-select"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { getVoiceWelcomeMessage } from "@/lib/voice/welcome"
import { toast } from "sonner"
import type { SupportedLanguage } from "@/types"
import type { ChatMessageInput } from "@/types/ai"
import { formatDistanceToNow } from "date-fns"
import { isSupportedLanguage } from "@/lib/i18n/languages"

const quickPrompts = [
  "My tomato leaves are turning yellow",
  "When should I water my rice paddy?",
  "Best fertilizer for chili plants",
  "මගේ ගොවිතැනට වතුර දෙන්නේ කවදාද?",
  "தக்காளி செடிகளுக்கு உரம்",
]

function toHistory(messages: VoiceUiMessage[]): ChatMessageInput[] {
  return messages
    .filter((m) => !m.streaming && m.content.trim())
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }))
}

export default function VoiceAssistantPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en")
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [messages, setMessages] = useState<VoiceUiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getVoiceWelcomeMessage("en"),
      timestamp: new Date(),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const assistantIdRef = useRef<string | null>(null)

  const {
    isProcessing,
    isSpeaking,
    useStreaming,
    setUseStreaming,
    processTurn,
    speak,
    stopSpeaking,
    loadConversation,
    startNewConversation,
    conversationId,
  } = useVoiceAssistant(language)

  const {
    isListening,
    isSupported: isLiveSpeechSupported,
    start: startLiveSpeech,
    stop: stopLiveSpeech,
  } = useRealtimeSpeechInput(language)

  const { conversations, loading: historyLoading, refresh, remove } =
    useVoiceConversations()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isSpeaking) setSpeakingId(null)
  }, [isSpeaking])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isListening) {
      interval = setInterval(() => setAudioLevel(Math.random() * 100), 100)
    } else {
      setAudioLevel(0)
    }
    return () => clearInterval(interval)
  }, [isListening])

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getVoiceWelcomeMessage(language),
        timestamp: new Date(),
      },
    ])
    startNewConversation()
  }, [language, startNewConversation])

  const fetchFollowUps = async (reply: string) => {
    try {
      const res = await fetch("/api/voice/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply, language }),
      })
      const json = await res.json()
      if (res.ok) setFollowUps(json.data ?? [])
    } catch {
      setFollowUps([])
    }
  }

  const runTurn = async (userText: string, transcript?: string) => {
    setFollowUps([])
    const userMsg: VoiceUiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      transcript,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    const assistantId = `a-${Date.now()}`
    assistantIdRef.current = assistantId
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      },
    ])

    const history = toHistory(messages)
    const reply = await processTurn(userText, history, {
      transcript,
      onAssistantUpdate: (content, streaming) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content, streaming } : m
          )
        )
      },
    })

    if (!reply) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      return
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: reply, streaming: false }
          : m
      )
    )

    if (!isMuted) {
      setSpeakingId(assistantId)
      speak(reply)
    }
    void fetchFollowUps(reply)
    refresh()
  }

  const handleVoiceToggle = async () => {
    if (isListening) {
      const text = await stopLiveSpeech()
      if (text) {
        setTextInput(text)
        await runTurn(text, text)
      }
    } else {
      stopSpeaking()
      await startLiveSpeech({
        initialText: textInput,
        onTextChange: setTextInput,
      })
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessing) return
    const text = textInput.trim()
    setTextInput("")
    await runTurn(text)
  }

  const handleLoadConversation = async (id: string) => {
    try {
      const data = await loadConversation(id)
      setLanguage(
        isSupportedLanguage(data.language) ? data.language : "en"
      )
      setMessages(
        data.messages.map((m, i) => ({
          id: `${id}-${i}`,
          role: m.role,
          content: m.content,
          transcript: m.transcript,
          timestamp: new Date(m.createdAt),
        }))
      )
      setShowHistory(false)
      setFollowUps([])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load chat")
    }
  }

  const handleNewChat = () => {
    startNewConversation()
    setFollowUps([])
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getVoiceWelcomeMessage(language),
        timestamp: new Date(),
      },
    ])
    setShowHistory(false)
  }

  const statusText = isListening
    ? "Speak now — your words appear in the box as you talk"
    : isSpeaking
      ? "Speaking…"
      : isProcessing
        ? "Thinking…"
        : "Tap the microphone and ask your farming question"

  return (
    <motion.div className="-m-6 flex min-h-[calc(100dvh-4rem)] w-[calc(100%+3rem)] flex-col">
      <motion.div className="shrink-0 border-b border-border bg-card/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {isLiveSpeechSupported
                ? "Live speech → text"
                : "Voice STT + OpenAI TTS"}
            </Badge>
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <Globe className="h-3 w-3" />
              VALSEA.ai
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              {useStreaming ? "Live stream" : "Standard"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Voice Assistant</h1>
          <p className="text-muted-foreground">
            Multilingual farming help powered by VALSEA.ai — 15+ Asian languages
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <VoiceLanguageSelect
            value={language}
            onChange={setLanguage}
            disabled={isProcessing || isListening}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
          >
            <History className="mr-1 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New chat
          </Button>
          <WhatsAppSupportButton size="sm" />
        </div>
      </div>

      </motion.div>

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:mx-6">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(100%,42rem)] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "border border-border bg-muted/50 rounded-tl-md"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          AgriMind AI
                        </span>
                        {message.streaming && (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        )}
                      </div>
                    )}
                    <p
                      className={
                        message.role === "user"
                          ? "text-primary-foreground whitespace-pre-wrap"
                          : "text-foreground whitespace-pre-wrap"
                      }
                    >
                      {message.content ||
                        (message.streaming ? "…" : "")}
                    </p>
                    {message.role === "assistant" &&
                      message.content &&
                      !message.streaming &&
                      message.id !== "welcome" && (
                        <VoiceMessageActions
                          content={message.content}
                          isSpeaking={speakingId === message.id && isSpeaking}
                          onSpeak={() => {
                            setSpeakingId(message.id)
                            speak(message.content)
                          }}
                        />
                      )}
                    {message.transcript &&
                      message.transcript !== message.content && (
                        <p className="mt-1 text-xs opacity-70">
                          Heard: {message.transcript}
                        </p>
                      )}
                    <p
                      className={`mt-1 text-xs ${
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-muted/30 p-6 sm:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-5">
              <VoiceMicButton
                size="large"
                isListening={isListening}
                isProcessing={isProcessing && !isListening}
                audioLevel={audioLevel}
                onClick={handleVoiceToggle}
              />

              <p className="text-center text-sm font-medium text-muted-foreground">
                {statusText}
              </p>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="stream"
                    checked={useStreaming}
                    onCheckedChange={setUseStreaming}
                  />
                  <Label htmlFor="stream" className="text-xs">
                    Realtime stream
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMuted(!isMuted)
                    if (!isMuted) stopSpeaking()
                  }}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening… speak and watch words appear here"
                      : "Type or tap the microphone to speak…"
                  }
                  rows={2}
                  className={`resize-none ${isListening ? "ring-2 ring-primary/40" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleTextSubmit()
                    }
                  }}
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {followUps.length > 0
                    ? "Suggested follow-ups:"
                    : "Quick questions:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(followUps.length > 0 ? followUps : quickPrompts).map(
                    (prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          if (followUps.length > 0) void runTurn(prompt)
                          else setTextInput(prompt)
                        }}
                        disabled={isProcessing}
                        className="rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-muted/80 disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {conversationId && (
                <p className="text-center text-[10px] text-muted-foreground">
                  Conversation saved
                </p>
              )}
          </div>
        </div>
      </div>

      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Saved conversations</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {historyLoading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved chats yet</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={String(c._id)}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handleLoadConversation(String(c._id))}
                  >
                    <p className="truncate font-medium">{String(c.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(String(c.updatedAt)), {
                        addSuffix: true,
                      })}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => remove(String(c._id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
