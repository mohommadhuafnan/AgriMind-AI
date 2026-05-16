"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useRealtimeSpeechInput } from "@/hooks/use-realtime-speech-input"
import { isBrowserSpeechRecognitionSupported } from "@/lib/voice/speech-recognition"
import type { SupportedLanguage } from "@/types"

type VoiceInputOptions = {
  initialText?: string
  onTextChange?: (text: string) => void
}

/** Mic input with live typing in the text box (browser STT) + Valsea fallback */
export function useVoiceInput(language: SupportedLanguage) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isValseaRecording, setIsValseaRecording] = useState(false)
  const realtime = useRealtimeSpeechInput(language)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const resolveStopRef = useRef<((text: string | null) => void) | null>(null)
  const optionsRef = useRef<VoiceInputOptions>({})

  const transcribeBlob = useCallback(
    async (blob: Blob): Promise<string | null> => {
      const formData = new FormData()
      formData.append("file", blob, "recording.webm")
      formData.append("language", language)

      const res = await fetch("/api/valsea/transcribe", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Transcription failed")
      return json.data?.text ?? null
    },
    [language]
  )

  const startValseaRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4"
    const recorder = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      setIsValseaRecording(false)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null

      let text: string | null = null
      const blob = new Blob(chunksRef.current, { type: mimeType })

      if (blob.size >= 1000) {
        setIsTranscribing(true)
        try {
          text = await transcribeBlob(blob)
          if (!text) toast.error("Could not understand audio.")
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Transcription failed"
          )
        } finally {
          setIsTranscribing(false)
        }
      } else {
        toast.error("Recording too short.")
      }

      if (text) {
        optionsRef.current.onTextChange?.(text)
      }
      resolveStopRef.current?.(text)
      resolveStopRef.current = null
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsValseaRecording(true)
  }, [transcribeBlob])

  const startListening = useCallback(
    async (options?: VoiceInputOptions) => {
      optionsRef.current = options ?? {}

      if (isBrowserSpeechRecognitionSupported()) {
        await realtime.start({
          initialText: options?.initialText ?? "",
          onTextChange: options?.onTextChange ?? (() => {}),
        })
        return
      }

      try {
        await startValseaRecording()
      } catch {
        toast.error("Microphone access denied.")
      }
    },
    [realtime, startValseaRecording]
  )

  const stopListening = useCallback((): Promise<string | null> => {
    if (realtime.isListening) {
      return realtime.stop()
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === "inactive") {
        resolve(null)
        return
      }
      resolveStopRef.current = resolve
      recorder.stop()
    })
  }, [realtime])

  const toggleListening = useCallback(
    async (options?: VoiceInputOptions): Promise<string | null> => {
      if (realtime.isListening || isValseaRecording) {
        return stopListening()
      }
      await startListening(options)
      return null
    },
    [isValseaRecording, realtime.isListening, startListening, stopListening]
  )

  return {
    isListening: realtime.isListening || isValseaRecording,
    isTranscribing,
    interimText: realtime.interimText,
    isLiveTypingSupported: isBrowserSpeechRecognitionSupported(),
    startListening,
    stopListening,
    toggleListening,
  }
}
