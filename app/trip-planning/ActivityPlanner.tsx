"use client"

import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TripActivity, TripStop } from "@/lib/types/trip"

interface ActivityPlannerProps {
  stop: TripStop
  dayNumber: number
  activities: TripActivity[]
  onAddActivity: (payload: Partial<TripActivity>) => Promise<TripActivity | null>
  onUpdateActivity: (payload: Partial<TripActivity> & { id: string }) => Promise<TripActivity | null>
  onDeleteActivity: (id: string) => Promise<boolean>
}

export function ActivityPlanner({
  stop,
  dayNumber,
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}: ActivityPlannerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newCost, setNewCost] = useState<number>(0)

  const handleAdd = async () => {
    if (!newName.trim()) return
    await onAddActivity({
      trip_stop_id: stop.id,
      day_number: dayNumber,
      activity_name: newName,
      activity_time: newTime,
      cost: newCost,
    })
    setNewName("")
    setNewTime("")
    setNewCost(0)
    setIsAdding(false)
  }

  const dayActivities = activities.filter((a) => a.day_number === dayNumber)

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#4A67C0] dark:text-[#6A87E0]">
          Day {dayNumber} Activities
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-7 px-2 text-[#4A67C0] hover:bg-[#E6F0FF]"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>

      {isAdding && (
        <Card className="border-dashed border-[#6A87E0] bg-[#F8FAFF] dark:bg-[#3A57B0]/10">
          <CardContent className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="activity-name" className="text-xs">Activity Name</Label>
                <Input
                  id="activity-name"
                  placeholder="e.g. Visit Taj Mahal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="activity-time" className="text-xs">Time (Optional)</Label>
                <Input
                  id="activity-time"
                  placeholder="e.g. 10:00 AM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="activity-cost" className="text-xs">Cost (₹)</Label>
                <Input
                  id="activity-cost"
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(Number.parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-[#4A67C0] text-white">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {dayActivities.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No activities planned for this day.</p>
        ) : (
          dayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-2 rounded-lg border border-[#E6F0FF] bg-white dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={() => onUpdateActivity({ id: activity.id, is_completed: !activity.is_completed })}
                >
                  {activity.is_completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </Button>
                <div>
                  <p className={`text-sm font-medium ${activity.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {activity.activity_name}
                  </p>
                  <div className="flex gap-2 mt-0.5">
                    {activity.activity_time && (
                      <span className="text-[10px] flex items-center text-muted-foreground">
                        <Clock className="h-2.5 w-2.5 mr-0.5" /> {activity.activity_time}
                      </span>
                    )}
                    {activity.cost ? (
                      <span className="text-[10px] flex items-center text-muted-foreground">
                        <DollarSign className="h-2.5 w-2.5 mr-0.5" /> ₹{activity.cost}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteActivity(activity.id)}
                className="h-6 w-6 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
