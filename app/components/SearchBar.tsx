"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants"

interface SearchBarProps {
  className?: string
  value?: string
  onSearchChange?: (value: string) => void
}

export function SearchBar({ className = "", value, onSearchChange }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const query = value ?? internalQuery

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/destinations?search=${encodeURIComponent(trimmedQuery)}&limit=5&sort=rating`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        const nextSuggestions = (payload.destinations ?? []).map((destination: { name: string; state: string }) =>
          `${destination.name}, ${destination.state}`,
        )
        setSuggestions(nextSuggestions)
      } catch {
        // Ignore aborted requests and transient network errors for suggestions.
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (onSearchChange) {
      onSearchChange(input)
    } else {
      setInternalQuery(input)
    }
    setOpen(true)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white dark:bg-gray-700 border-2 border-[#4A67C0] dark:border-[#3A57B0] rounded-full shadow-md focus-within:ring-2 focus-within:ring-[#4A67C0] dark:focus-within:ring-[#6A87E0] focus-within:border-[#4A67C0] dark:focus-within:border-[#6A87E0]">
        <Search className="w-6 h-6 ml-4 text-[#4A67C0] dark:text-[#6A87E0]" />
        <Input
          type="text"
          placeholder="Where would you like to go?"
          className="flex-grow border-0 focus-visible:ring-0 text-lg bg-transparent text-gray-800 dark:text-white"
          value={query}
          onChange={handleInputChange}
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-[#6A87E0] dark:border-[#5A77D0]">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-[#F0F4FF] dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-white"
              onClick={() => {
                if (onSearchChange) {
                  onSearchChange(suggestion)
                } else {
                  setInternalQuery(suggestion)
                }
                setSuggestions([])
                setOpen(false)
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
