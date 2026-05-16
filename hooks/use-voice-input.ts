"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useRealtimeSpeechInput } from "@/hooks/use-realtime-speech-input"
import {
  isBrowserSpeechRecognitionSupported,
  supportsLiveBrowserStt,
} from "@/lib/voice/speech-recognition"
import type { SupportedLanguage } from "@/types"

type VoiceInputOptions = {
  initialText?: string
  onTextChange?: (text: string) => void
}

const MIN_RECORDING_BYTES = 400

/** Mic: live typing when browser STT works; always records audio for VALSEA on stop */
export function useVoiceInput(language: SupportedLanguage) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const realtime = useRealtimeSpeechInput(language)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef("audio/webm")
  const resolveStopRef = useRef<((text: string | null) => void) | null>(null)
  const skipTranscribeRef = useRef(false)
  const optionsRef = useRef<VoiceInputOptions>({})

  const liveSttEnabled =
    isBrowserSpeechRecognitionSupported() && supportsLiveBrowserStt(language)

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

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const stopRecorderAndTranscribe = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === "inactive") {
        releaseStream()
        resolve(null)
        return
      }

      resolveStopRef.current = resolve
      try {
        recorder.stop()
      } catch {
        releaseStream()
        resolve(null)
        resolveStopRef.current = null
      }
    })
  }, [releaseStream])

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : ""
      mimeTypeRef.current = mimeType || "audio/webm"

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      )
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setIsRecording(false)
        releaseStream()
        mediaRecorderRef.current = null

        if (skipTranscribeRef.current) {
          skipTranscribeRef.current = false
          resolveStopRef.current?.(null)
          resolveStopRef.current = null
          return
        }

        let text: string | null = null
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current,
        })

        if (blob.size >= MIN_RECORDING_BYTES) {
          setIsTranscribing(true)
          try {
            text = await transcribeBlob(blob)
            if (!text?.trim()) {
              toast.error("Could not understand your voice. Try again.")
            }
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Transcription failed"
            )
          } finally {
            setIsTranscribing(false)
          }
        } else {
          toast.error("Recording too short. Speak longer, then tap the red button.")
        }

        if (text?.trim()) {
          optionsRef.current.onTextChange?.(text.trim())
        }

        resolveStopRef.current?.(text?.trim() ?? null)
        resolveStopRef.current = null
      }

      mediaRecorderRef.current = recorder
      recorder.start(250)
      setIsRecording(true)
      return true
    } catch {
      toast.error("Microphone access denied. Allow mic in browser settings.")
      return false
    }
  }, [releaseStream, transcribeBlob])

  const startListening = useCallback(
    async (options?: VoiceInputOptions): Promise<boolean> => {
      optionsRef.current = options ?? {}
      const initial = options?.initialText?.trim() ?? ""
      options?.onTextChange?.(initial)

      const recordingOk = await startRecording()
      if (!recordingOk) return false

      if (liveSttEnabled) {
        const sttOk = await realtime.start({
          initialText: initial,
          onTextChange: options?.onTextChange ?? (() => {}),
          micAlreadyGranted: true,
        })
        if (!sttOk) {
          toast.message(
            "Recording audio — tap the red button to turn speech into text",
            { duration: 4000 }
          )
        }
      } else {
        toast.message(
          "Recording — speak, then tap the red button to convert to text",
          { duration: 4000 }
        )
      }

      return true
    },
    [liveSttEnabled, realtime, startRecording]
  )

  const stopListening = useCallback(async (): Promise<string | null> => {
    let liveText = ""

    if (realtime.isListening) {
      liveText = (await realtime.stop()).trim()
    }

    let valseaText: string | null = null
    if (liveText.length >= 2) {
      skipTranscribeRef.current = true
      await stopRecorderAndTranscribe()
    } else {
      valseaText = (await stopRecorderAndTranscribe())?.trim() ?? null
    }

    const merged = liveText || valseaText || null

    if (merged) {
      optionsRef.current.onTextChange?.(merged)
    }

    return merged
  }, [realtime, stopRecorderAndTranscribe])

  const toggleListening = useCallback(
    async (options?: VoiceInputOptions): Promise<string | null> => {
      if (isRecording || realtime.isListening) {
        return stopListening()
      }
      const ok = await startListening(options)
      return ok ? null : null
    },
    [isRecording, realtime.isListening, startListening, stopListening]
  )

  return {
    isListening: isRecording || realtime.isListening,
    isTranscribing,
    interimText: realtime.interimText,
    isLiveTypingSupported: liveSttEnabled,
    startListening,
    stopListening,
    toggleListening,
  }
}
