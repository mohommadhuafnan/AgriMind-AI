"use client"

import { ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getLanguageDisplayLabel,
  getLanguagesByRegion,
} from "@/lib/i18n/languages"
import { cn } from "@/lib/utils"
import type { SupportedLanguage } from "@/types"

type VoiceLanguageSelectProps = {
  value: SupportedLanguage
  onChange: (code: SupportedLanguage) => void
  disabled?: boolean
  className?: string
}

const languageGroups = getLanguagesByRegion()

export function VoiceLanguageSelect({
  value,
  onChange,
  disabled,
  className,
}: VoiceLanguageSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 min-w-[160px] justify-between gap-2 border-primary/20 bg-background px-3 font-medium",
            className
          )}
          data-no-translate
        >
          <span className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{getLanguageDisplayLabel(value)}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-0"
        data-no-translate
      >
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-semibold text-foreground">VALSEA.ai</p>
          <p className="text-[11px] text-muted-foreground">
            Asian languages — voice &amp; translation
          </p>
        </div>
        <ScrollArea className="h-[min(70vh,380px)]">
          <div className="p-1">
            {languageGroups.map((group, gi) => (
              <div key={group.region}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    className={cn(
                      "cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary",
                      value === lang.code && "bg-primary/10 font-medium text-primary"
                    )}
                    onClick={() => onChange(lang.code as SupportedLanguage)}
                  >
                    <span className="truncate">{lang.nativeLabel}</span>
                    {lang.nativeLabel !== lang.label && (
                      <span className="ml-auto max-w-[100px] truncate text-xs text-muted-foreground">
                        {lang.label}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
