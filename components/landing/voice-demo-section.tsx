"use client"

import { motion } from "framer-motion"
import { Mic, Volume2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const languages = [
  { code: "si", label: "සිංහල", sample: "මගේ ටොමැටෝ පැල්ලිවල දුඹුරු ලුණු තියෙනවා" },
  { code: "ta", label: "தமிழ்", sample: "என் தக்காளி இலைகளில் பழுப்பு புள்ளிகள் உள்ளன" },
  { code: "en", label: "English", sample: "My tomato leaves have brown spots" },
]

export function VoiceDemoSection() {
  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Mic className="h-4 w-4" />
            AI Voice Assistant
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Speak Naturally in <span className="gradient-text">Your Language</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Speak in Sinhala, Tamil, or English — Valsea transcribes your voice, OpenAI answers,
            and natural text-to-speech reads replies aloud.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{lang.label}</span>
              </div>
              <p className="text-sm text-muted-foreground italic mb-6">&ldquo;{lang.sample}&rdquo;</p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
                >
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <motion.div className="flex-1 flex gap-0.5 items-end h-8">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <motion.div
                      key={j}
                      className="w-1 rounded-full bg-primary/60"
                      animate={{ height: [8, 20 + (j % 3) * 8, 8] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: j * 0.05 + i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" asChild>
            <Link href="/login">Try Voice Assistant</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
