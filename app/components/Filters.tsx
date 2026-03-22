"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Region } from "@/lib/types/destination"

interface FiltersValue {
  region: Region | "all"
  category: Category | "all"
}

interface FiltersProps {
  value?: FiltersValue
  onChange?: (next: FiltersValue) => void
}

const DEFAULT_FILTERS: FiltersValue = {
  region: "all",
  category: "all",
}

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: "cultural-heritage", label: "Cultural Heritage" },
  { value: "religious", label: "Religious" },
  { value: "nature-wildlife", label: "Nature and Wildlife" },
  { value: "adventure", label: "Adventure" },
  { value: "arts-science", label: "Arts and Science" },
  { value: "shopping", label: "Shopping" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "culinary", label: "Culinary" },
  { value: "sports-recreation", label: "Sports and Recreation" },
]

export function Filters({ value, onChange }: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<FiltersValue>(value ?? DEFAULT_FILTERS)

  useEffect(() => {
    if (value) {
      setLocalFilters(value)
    }
  }, [value])

  const current = value ?? localFilters

  const updateFilters = (next: FiltersValue) => {
    if (!value) {
      setLocalFilters(next)
    }
    onChange?.(next)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 border border-[#C4D7FF] dark:border-[#5A75C0]">
      <h2 className="text-2xl font-semibold text-[#6A87E0] dark:text-[#87A2FF]">Filters</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="region" className="text-gray-800 dark:text-white">
            Region
          </Label>
          <Select
            value={current.region}
            onValueChange={(next) => updateFilters({ ...current, region: next as Region | "all" })}
          >
            <SelectTrigger
              id="region"
              className="border-[#C4D7FF] dark:border-[#5A75C0] text-white dark:text-white bg-[#6A87E0] dark:bg-[#5A75C0]"
            >
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="all" className="text-gray-800 dark:text-white">
                All Regions
              </SelectItem>
              <SelectItem value="north" className="text-gray-800 dark:text-white">
                North
              </SelectItem>
              <SelectItem value="south" className="text-gray-800 dark:text-white">
                South
              </SelectItem>
              <SelectItem value="east" className="text-gray-800 dark:text-white">
                East
              </SelectItem>
              <SelectItem value="west" className="text-gray-800 dark:text-white">
                West
              </SelectItem>
              <SelectItem value="central" className="text-gray-800 dark:text-white">
                Central
              </SelectItem>
              <SelectItem value="northeast" className="text-gray-800 dark:text-white">
                North East
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-800 dark:text-white">
            Category
          </Label>
          <Select
            value={current.category}
            onValueChange={(next) => updateFilters({ ...current, category: next as Category | "all" })}
          >
            <SelectTrigger
              id="category"
              className="border-[#C4D7FF] dark:border-[#5A75C0] text-white dark:text-white bg-[#6A87E0] dark:bg-[#5A75C0]"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="all" className="text-gray-800 dark:text-white">
                All Categories
              </SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value} className="text-gray-800 dark:text-white">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

