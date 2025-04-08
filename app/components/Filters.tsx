"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Filters() {
  const [region, setRegion] = useState("all")
  const [locationType, setLocationType] = useState("any")

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6 border border-[#6A87E0] dark:border-[#5A77D0]">
      <h2 className="text-2xl font-semibold text-[#4A67C0] dark:text-[#6A87E0]">Filters</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="region" className="text-gray-800 dark:text-white">
            Places in India
          </Label>
          <Select value={region} onValueChange={setRegion}>
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
              <SelectItem value="north" className="text-gray-800 dark:text-white">
                North India
              </SelectItem>
              <SelectItem value="south" className="text-gray-800 dark:text-white">
                South India
              </SelectItem>
              <SelectItem value="east" className="text-gray-800 dark:text-white">
                East India
              </SelectItem>
              <SelectItem value="west" className="text-gray-800 dark:text-white">
                West India
              </SelectItem>
              <SelectItem value="central" className="text-gray-800 dark:text-white">
                Central India
              </SelectItem>
              <SelectItem value="northeast" className="text-gray-800 dark:text-white">
                Northeast India
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-type" className="text-gray-800 dark:text-white">
            Type of Location
          </Label>
          <Select value={locationType} onValueChange={setLocationType}>
            <SelectTrigger
              id="location-type"
              className="border-[#6A87E0] dark:border-[#5A77D0] text-white dark:text-white bg-[#4A67C0] dark:bg-[#3A57B0]"
            >
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800">
              <SelectItem value="any" className="text-gray-800 dark:text-white">
                Any
              </SelectItem>
              <SelectItem value="restaurant" className="text-gray-800 dark:text-white">
                Restaurant
              </SelectItem>
              <SelectItem value="bar" className="text-gray-800 dark:text-white">
                Bar
              </SelectItem>
              <SelectItem value="theatre" className="text-gray-800 dark:text-white">
                Theatre
              </SelectItem>
              <SelectItem value="museum" className="text-gray-800 dark:text-white">
                Museum
              </SelectItem>
              <SelectItem value="temple" className="text-gray-800 dark:text-white">
                Temple
              </SelectItem>
              <SelectItem value="park" className="text-gray-800 dark:text-white">
                Park
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
