"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  className?: string
  value?: string
  onSearchChange?: (value: string) => void
}

const mockSuggestions = [
  "Jaipur, Rajasthan",
  "Mumbai, Maharashtra",
  "Goa",
  "Delhi",
  "Kolkata, West Bengal",
  "Varanasi, Uttar Pradesh",
  "Udaipur, Rajasthan",
]

export function SearchBar({ className = "", value, onSearchChange }: SearchBarProps) {
  const [query, setQuery] = useState(value ?? "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (value !== undefined) setQuery(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setQuery(input)
    setSuggestions(
      input.trim()
        ? mockSuggestions.filter((s) => s.toLowerCase().includes(input.toLowerCase()))
        : []
    )
    onSearchChange?.(input)
  }

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion)
    setSuggestions([])
    onSearchChange?.(suggestion)
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    onSearchChange?.("")
  }

  const inputValue = value ?? query

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 bg-white dark:bg-card border rounded-xl shadow-sm px-4 py-3 transition-all duration-150 ${
          focused
            ? "border-primary ring-2 ring-primary/20 shadow-md"
            : "border-border hover:border-primary/40"
        }`}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search destinations, cities, or states…"
          className="flex-grow bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            tabIndex={-1}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && focused && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                onMouseDown={() => handleSelect(suggestion)}
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
