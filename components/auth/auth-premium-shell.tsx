"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { AuthCursorGlow } from "@/components/auth/auth-cursor-glow"
import { AuthParticleField } from "@/components/auth/auth-particle-field"
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel"
import { AuthForm } from "@/components/auth/auth-form"
import type { AuthMode } from "@/components/auth/auth-types"
import { authSpring } from "@/components/auth/auth-types"
import { cn } from "@/lib/utils"

export function AuthPremiumShell() {
  const [mode, setMode] = useState<AuthMode>("login")

  return (
    <motion.div
      data-no-translate
      className="relative min-h-screen overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            mode === "login"
              ? "radial-gradient(ellipse at top, oklch(0.55 0.18 145 / 0.12), transparent 55%), radial-gradient(ellipse at bottom right, oklch(0.75 0.15 85 / 0.1), transparent 50%)"
              : "radial-gradient(ellipse at top, oklch(0.5 0.16 160 / 0.14), transparent 55%), radial-gradient(ellipse at bottom left, oklch(0.7 0.14 90 / 0.12), transparent 50%)",
        }}
        transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
      />
      <AuthCursorGlow />
      <AuthParticleField />

      <Link
        href="/"
        className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <motion.div
        className="relative z-10 flex min-h-screen items-center justify-center p-4 py-16 md:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...authSpring, delay: 0.05 }}
      >
        <div className="w-full max-w-[960px] overflow-hidden rounded-[28px] border border-white/20 bg-background/40 shadow-[0_32px_80px_-20px_oklch(0.2_0.05_145/0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-background/30">
          <motion.div
            className={cn(
              "flex flex-col md:flex-row",
              mode === "signup" && "md:flex-row-reverse"
            )}
            layout
            transition={authSpring}
          >
            <motion.div
              className="relative w-full md:w-[46%]"
              layout="position"
              transition={authSpring}
            >
              <AuthBrandPanel mode={mode} />
            </motion.div>

            <motion.div
              className="relative w-full border-t border-border/40 bg-background/80 backdrop-blur-xl md:w-[54%] md:border-t-0 md:border-l"
              layout="position"
              transition={authSpring}
            >
              <AuthForm mode={mode} onModeChange={setMode} embedded />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
