"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Mock function to get suggestions
  const getSuggestions = (input: string) => {
    const mockSuggestions = ["Jaipur, Rajasthan", "Mumbai, Maharashtra", "Goa", "Delhi", "Kolkata, West Bengal"]
    return mockSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(input.toLowerCase()))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setQuery(input)
    setSuggestions(getSuggestions(input))
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
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-[#6A87E0] dark:border-[#5A77D0]">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-[#F0F4FF] dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-white"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
