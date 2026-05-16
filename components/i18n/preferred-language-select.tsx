"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getLanguageDisplayLabel,
  getLanguagesByRegion,
  isSupportedLanguage,
} from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

const languageGroups = getLanguagesByRegion()

type PreferredLanguageSelectProps = {
  value: SupportedLanguage
  onChange: (code: SupportedLanguage) => void
  disabled?: boolean
}

export function PreferredLanguageSelect({
  value,
  onChange,
  disabled,
}: PreferredLanguageSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (isSupportedLanguage(v)) onChange(v)
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" data-no-translate>
        <SelectValue placeholder="Choose language">
          {getLanguageDisplayLabel(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="max-h-[min(70vh,380px)]"
        data-no-translate
      >
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-semibold text-foreground">VALSEA.ai</p>
          <p className="text-[11px] text-muted-foreground">
            15 Asian languages — chat, voice & translations
          </p>
        </div>
        {languageGroups.map((group) => (
          <SelectGroup key={group.region}>
            <SelectLabel className="text-xs text-muted-foreground">
              {group.label}
            </SelectLabel>
            {group.languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{lang.nativeLabel}</span>
                  {lang.nativeLabel !== lang.label && (
                    <span className="text-xs text-muted-foreground">
                      {lang.label}
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
