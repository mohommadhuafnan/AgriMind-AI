"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useRealtimeSpeechInput } from "@/hooks/use-realtime-speech-input"
import {
  isBrowserSpeechRecognitionSupported,
  supportsLiveBrowserStt,
} from "@/lib/voice/speech-recognition"
import {
  audioFilenameForMime,
  pickAudioMimeType,
} from "@/lib/voice/recording"
import {
  AUTO_DETECT_LANGUAGE,
  isAutoDetectLanguage,
  type VoiceLanguagePreference,
} from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

type VoiceInputOptions = {
  initialText?: string
  onTextChange?: (text: string) => void
}

const MIN_RECORDING_BYTES = 1200
const MIN_RECORDING_MS = 700

export type VoiceStopResult = {
  text: string | null
  errorShown: boolean
}

/** Mic: live typing when browser STT works; always records audio for VALSEA on stop */
export function useVoiceInput(languagePreference: VoiceLanguagePreference) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const sttLanguage: SupportedLanguage = isAutoDetectLanguage(languagePreference)
    ? "en"
    : languagePreference

  const realtime = useRealtimeSpeechInput(sttLanguage)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef("audio/webm")
  const recordStartedAtRef = useRef(0)
  const resolveStopRef = useRef<((text: string | null) => void) | null>(null)
  const skipTranscribeRef = useRef(false)
  const optionsRef = useRef<VoiceInputOptions>({})
  const lastErrorShownRef = useRef(false)

  const transcribeLanguage: SupportedLanguage | "auto" =
    isAutoDetectLanguage(languagePreference)
      ? AUTO_DETECT_LANGUAGE
      : languagePreference

  const liveSttEnabled =
    !isAutoDetectLanguage(languagePreference) &&
    isBrowserSpeechRecognitionSupported() &&
    supportsLiveBrowserStt(languagePreference)

  const transcribeBlob = useCallback(
    async (blob: Blob, filename: string): Promise<string | null> => {
      const formData = new FormData()
      formData.append("file", blob, filename)
      formData.append("language", transcribeLanguage)

      const res = await fetch("/api/valsea/transcribe", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Transcription failed")
      return json.data?.text ?? null
    },
    [transcribeLanguage]
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
        if (recorder.state === "recording") {
          recorder.requestData()
        }
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      const mimeType = pickAudioMimeType()
      mimeTypeRef.current = mimeType

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      )
      chunksRef.current = []
      recordStartedAtRef.current = Date.now()

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
        const filename = audioFilenameForMime(mimeTypeRef.current)
        const durationMs = Date.now() - recordStartedAtRef.current

        if (
          blob.size >= MIN_RECORDING_BYTES &&
          durationMs >= MIN_RECORDING_MS
        ) {
          setIsTranscribing(true)
          try {
            text = await transcribeBlob(blob, filename)
            if (!text?.trim()) {
              lastErrorShownRef.current = true
              toast.error(
                "Could not understand your voice. Speak clearly and try again."
              )
            }
          } catch (err) {
            lastErrorShownRef.current = true
            toast.error(
              err instanceof Error ? err.message : "Transcription failed"
            )
          } finally {
            setIsTranscribing(false)
          }
        } else {
          lastErrorShownRef.current = true
          toast.error(
            "Recording too short. Hold the mic, speak for at least a second, then tap red."
          )
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
      lastErrorShownRef.current = true
      toast.error("Microphone access denied. Allow mic in browser settings.")
      return false
    }
  }, [releaseStream, transcribeBlob])

  const startListening = useCallback(
    async (options?: VoiceInputOptions): Promise<boolean> => {
      lastErrorShownRef.current = false
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
          isAutoDetectLanguage(languagePreference)
            ? "Recording — speak in any language, then tap the red button"
            : "Recording — speak, then tap the red button to convert to text",
          { duration: 4000 }
        )
      }

      return true
    },
    [languagePreference, liveSttEnabled, realtime, startRecording]
  )

  const stopListening = useCallback(async (): Promise<VoiceStopResult> => {
    let liveText = ""

    if (realtime.isListening) {
      liveText = (await realtime.stop()).trim()
    }

    let valseaText: string | null = null
    const shouldUseValsea =
      isAutoDetectLanguage(languagePreference) || liveText.length < 2

    if (liveText.length >= 2 && !shouldUseValsea) {
      skipTranscribeRef.current = true
      await stopRecorderAndTranscribe()
    } else {
      valseaText = (await stopRecorderAndTranscribe())?.trim() ?? null
    }

    const merged =
      shouldUseValsea && valseaText
        ? valseaText
        : liveText || valseaText || null

    if (merged) {
      optionsRef.current.onTextChange?.(merged)
    }

    return {
      text: merged,
      errorShown: lastErrorShownRef.current,
    }
  }, [languagePreference, realtime, stopRecorderAndTranscribe])

  const toggleListening = useCallback(
    async (options?: VoiceInputOptions): Promise<VoiceStopResult | null> => {
      if (isRecording || realtime.isListening) {
        return stopListening()
      }
      const ok = await startListening(options)
      return ok ? null : { text: null, errorShown: lastErrorShownRef.current }
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
