"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MultiStopPlanner({ tripStops, setTripStops }) {
  const [newStop, setNewStop] = useState("")

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tripStops)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTripStops(items)
  }

  const addStop = () => {
    if (newStop.trim() !== "") {
      setTripStops([...tripStops, { id: `stop${tripStops.length + 1}`, name: newStop, state: "" }])
      setNewStop("")
    }
  }

  return (
    <Card className="border-[#6A87E0] dark:border-[#5A77D0]">
      <CardHeader>
        <CardTitle className="text-[#4A67C0] dark:text-[#6A87E0]">Multi-Stop Trip Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Add a new stop"
            value={newStop}
            onChange={(e) => setNewStop(e.target.value)}
            className="border-[#6A87E0] dark:border-[#5A77D0]"
          />
          <Button
            onClick={addStop}
            className="bg-[#4A67C0] hover:bg-[#6A87E0] text-white dark:bg-[#6A87E0] dark:hover:bg-[#8AA7FF]"
          >
            Add
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {tripStops.map((stop, index) => (
                  <Draggable key={stop.id} draggableId={stop.id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center bg-white dark:bg-gray-700 rounded p-2 text-gray-800 dark:text-white border border-[#6A87E0] dark:border-[#5A77D0]"
                      >
                        <span {...provided.dragHandleProps} className="mr-2">
                          <GripVertical className="w-5 h-5 text-[#4A67C0] dark:text-[#6A87E0]" />
                        </span>
                        {stop.name}
                        {stop.state && `, ${stop.state}`}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-[#4A67C0] hover:bg-[#E6F0FF] dark:text-[#6A87E0] dark:hover:bg-[#3A57B0]"
                          onClick={() => setTripStops(tripStops.filter((s) => s.id !== stop.id))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  )
}
