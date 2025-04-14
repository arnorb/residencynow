import { ChevronDown, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Building, BuildingWithAudit } from "@/services/supabase"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface BuildingSelectorProps {
  buildings: Building[] | BuildingWithAudit[]
  selectedBuildingId: number
  onBuildingSelect: (buildingId: number) => void
  isLoading?: boolean
  className?: string
}

export function BuildingSelector({
  buildings,
  selectedBuildingId,
  onBuildingSelect,
  isLoading,
  className
}: BuildingSelectorProps) {
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

  // Function to check if a building has audit info
  const hasAuditInfo = (building: Building): building is BuildingWithAudit => {
    return 'lastEdit' in building && !!building.lastEdit
  }

  // Function to format operation type
  const formatOperation = (operation: string): string => {
    switch (operation) {
      case 'INSERT':
        return 'Added'
      case 'UPDATE':
        return 'Updated'
      case 'DELETE':
        return 'Deleted'
      default:
        return 'Modified'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(
          "group flex items-center gap-2 outline-none",
          isLoading && "pointer-events-none opacity-50",
          className
        )}
        disabled={isLoading}
      >
        <h1 className="text-4xl font-semibold">
          {selectedBuilding?.title || "Veldu byggingu"}
        </h1>
        <div className="relative w-6 h-6">
          <ChevronDown 
            className="absolute inset-0 transition-opacity duration-150 group-data-[state=open]:opacity-0" 
          />
          <ChevronUp
            className="absolute inset-0 transition-opacity duration-150 opacity-0 group-data-[state=open]:opacity-100"
          />
        </div>
        {isLoading && (
          <div className="ml-2 w-4 h-4 border-2 border-t-primary border-gray-200 rounded-full animate-spin" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {buildings.map((building) => (
          <DropdownMenuItem
            key={building.id}
            onSelect={() => onBuildingSelect(building.id)}
            className="flex flex-col items-start py-2"
          >
            <span>{building.title}</span>
            {hasAuditInfo(building) && building.lastEdit && (
              <span className="text-xs text-muted-foreground mt-1">
                {formatOperation(building.lastEdit.operation)} {formatDistanceToNow(new Date(building.lastEdit.timestamp))} ago
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 