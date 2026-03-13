"use client"

import { CATEGORIES, CATEGORY_LABELS, REGIONS, REGION_LABELS } from "@/lib/constants"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Region } from "@/lib/types/destination"

interface FiltersValue {
  region: Region | "all"
  category: Category | "all"
}

interface FiltersProps {
  value: FiltersValue
  onChange: (value: FiltersValue) => void
}

export function Filters({ value, onChange }: FiltersProps) {
  const handleRegionChange = (region: string) => {
    onChange({ ...value, region: region as Region | "all" })
  }

  const handleCategoryChange = (category: string) => {
    onChange({ ...value, category: category as Category | "all" })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 border border-[#6A87E0] dark:border-[#5A77D0]">
      <h2 className="text-2xl font-semibold text-[#4A67C0] dark:text-[#6A87E0]">Filters</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="region" className="text-gray-800 dark:text-white">
            Places in India
          </Label>
          <Select value={value.region} onValueChange={handleRegionChange}>
            <SelectTrigger
              id="region"
              className="border-[#6A87E0] dark:border-[#5A77D0] text-white dark:text-white bg-[#4A67C0] dark:bg-[#3A57B0]"
            >
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="all" className="text-gray-800 dark:text-white">
                All India
              </SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region} className="text-gray-800 dark:text-white">
                  {REGION_LABELS[region]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-type" className="text-gray-800 dark:text-white">
            Type of Location
          </Label>
          <Select value={value.category} onValueChange={handleCategoryChange}>
            <SelectTrigger
              id="location-type"
              className="border-[#6A87E0] dark:border-[#5A77D0] text-white dark:text-white bg-[#4A67C0] dark:bg-[#3A57B0]"
            >
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="all" className="text-gray-800 dark:text-white">
                All Categories
              </SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category} className="text-gray-800 dark:text-white">
                  {CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
