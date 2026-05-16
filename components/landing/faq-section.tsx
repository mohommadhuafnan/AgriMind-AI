"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What crops does AgriMind AI support?",
    a: "We support Rice, Tea, Coconut, Tomato, Chili, Onion, Banana, Corn, and Carrot — with more crops coming in future updates.",
  },
  {
    q: "Which languages are supported?",
    a: "AgriMind AI supports Sinhala, Tamil, and English for both text and voice interactions.",
  },
  {
    q: "Is AgriMind AI free to use?",
    a: "Farmers can start with a free tier. Premium features for advanced analytics and officer support will be available in later phases.",
  },
  {
    q: "How accurate is the disease detection?",
    a: "Our AI achieves up to 95% accuracy on supported crops when clear photos are provided. Always consult local agriculture officers for critical decisions.",
  },
  {
    q: "Can I connect with agriculture officers?",
    a: "Yes! WhatsApp officer support and direct communication features will be available in Phase 5.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
