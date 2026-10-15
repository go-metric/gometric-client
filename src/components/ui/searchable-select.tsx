"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export type SelectOption = { value: string; label: string }

type SearchableSelectProps = {
  id?: string
  name?: string
  options: SelectOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  /** Shown when the filter matches nothing. */
  emptyText?: string
}

function findOption(options: SelectOption[], value: string | null | undefined) {
  if (value == null || value === "") return null
  return options.find((o) => o.value === value) ?? null
}

/** Searchable single-select for long option lists (timezones, countries, …). */
export function SearchableSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Search…",
  disabled,
  required,
  className,
  emptyText = "No results found.",
}: SearchableSelectProps) {
  const controlled = value !== undefined
  const selected = findOption(options, value)
  const defaultSelected = findOption(options, defaultValue)

  return (
    <Combobox
      items={options}
      name={name}
      disabled={disabled}
      required={required}
      value={controlled ? selected : undefined}
      defaultValue={controlled ? undefined : defaultSelected}
      onValueChange={(next) => {
        onValueChange?.(next ? next.value : null)
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-10 w-full rounded-xl bg-card", className)}
      />
      <ComboboxContent className="rounded-xl">
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
