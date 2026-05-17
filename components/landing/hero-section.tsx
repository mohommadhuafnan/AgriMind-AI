"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Mic, 
  Camera, 
  Sparkles,
  Play
} from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Farming Assistant</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Your AI Farming Partner{" "}
              <span className="gradient-text">From Seed To Harvest</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              AgriMind AI helps Sri Lankan farmers with crop disease detection,
              multilingual voice support, and smart farming guidance. Understands
              Asian accented speech — Singlish, Chinglish, Sichuanese, Vietnamese,
              Bahasa, Thai, Tamil, and more.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/login">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
                <Link href="#demo">
                  <Play className="h-4 w-4" /> Watch Demo
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Farmers</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Card */}
              <div className="glass rounded-3xl p-6 shadow-2xl">
                {/* Mock App Interface */}
                <div className="bg-background rounded-2xl p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">AgriMind AI</div>
                        <div className="text-xs text-muted-foreground">Online</div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 min-h-[200px]">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-end"
                    >
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                        <p className="text-sm">My tomato leaves are turning yellow with brown spots</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-foreground">
                          Based on your description, this appears to be <span className="font-semibold text-primary">Early Blight</span>. 
                          Let me analyze further. Can you upload a photo?
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-muted-foreground">Generating treatment plan...</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Input Area */}
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="flex-1 text-sm text-muted-foreground px-2">
                      Type or speak your question...
                    </div>
                    <button className="p-2 bg-primary rounded-lg">
                      <Mic className="h-5 w-5 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-4 -right-4 glass rounded-2xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Mic className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">Voice Support</div>
                    <div className="text-xs text-muted-foreground">3 Languages</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <Camera className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">Photo Analysis</div>
                    <div className="text-xs text-muted-foreground">AI Detection</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-1 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
