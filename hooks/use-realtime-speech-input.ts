"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import {
  createSpeechRecognition,
  isBrowserSpeechRecognitionSupported,
  joinSpokenText,
  speechLangForCode,
  type BrowserSpeechRecognition,
} from "@/lib/voice/speech-recognition"
import type { SupportedLanguage } from "@/types"

export interface RealtimeSpeechOptions {
  /** Text already in the input before speaking */
  initialText?: string
  /** Called whenever transcript updates (interim + final) */
  onTextChange: (text: string) => void
}

export function useRealtimeSpeechInput(language: SupportedLanguage) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const keepAliveRef = useRef(false)
  const baseTextRef = useRef("")
  const latestTextRef = useRef("")
  const onChangeRef = useRef<(text: string) => void>(() => {})

  const supported = isBrowserSpeechRecognitionSupported()

  const applyDisplay = useCallback((text: string) => {
    latestTextRef.current = text
    setInterimText(text)
    onChangeRef.current(text)
  }, [])

  const start = useCallback(
    async (options: RealtimeSpeechOptions) => {
      if (!supported) {
        toast.error(
          "Live speech typing needs Chrome or Edge. Try updating your browser."
        )
        return false
      }

      const recognition = createSpeechRecognition()
      if (!recognition) return false

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        toast.error("Microphone access denied.")
        return false
      }

      baseTextRef.current = options.initialText?.trim() ?? ""
      onChangeRef.current = options.onTextChange
      keepAliveRef.current = true

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = speechLangForCode(language)

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let sessionFinal = ""
        let sessionInterim = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ""
          if (result.isFinal) {
            sessionFinal += transcript
          } else {
            sessionInterim += transcript
          }
        }

        if (sessionFinal.trim()) {
          baseTextRef.current = joinSpokenText(
            baseTextRef.current,
            sessionFinal
          )
        }

        const display = joinSpokenText(baseTextRef.current, sessionInterim)
        applyDisplay(display)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "aborted" || event.error === "no-speech") return
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied.")
        } else if (event.error !== "network") {
          toast.error(`Speech recognition: ${event.error}`)
        }
        keepAliveRef.current = false
        setIsListening(false)
      }

      recognition.onend = () => {
        if (keepAliveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch {
            keepAliveRef.current = false
            setIsListening(false)
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
      applyDisplay(baseTextRef.current)
      return true
    },
    [applyDisplay, language, supported]
  )

  const stop = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      keepAliveRef.current = false
      const recognition = recognitionRef.current

      if (!recognition) {
        setIsListening(false)
        resolve(latestTextRef.current.trim())
        return
      }

      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        recognitionRef.current = null
        setIsListening(false)
        resolve(latestTextRef.current.trim())
      }

      recognition.onend = finish
      try {
        recognition.stop()
      } catch {
        finish()
      }

      window.setTimeout(finish, 1200)
    })
  }, [])

  const toggle = useCallback(
    async (options: RealtimeSpeechOptions): Promise<string | null> => {
      if (isListening) {
        return stop()
      }
      const ok = await start(options)
      return ok ? null : null
    },
    [isListening, start, stop]
  )

  return {
    isListening,
    interimText,
    isSupported: supported,
    start,
    stop,
    toggle,
  }
}
