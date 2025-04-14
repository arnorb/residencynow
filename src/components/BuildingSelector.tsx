import { ChevronDown, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Building, BuildingWithAudit } from "@/services/supabase"
import { cn } from "@/lib/utils"

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
        return 'Bætt við'
      case 'UPDATE':
        return 'Uppfært'
      case 'DELETE':
        return 'Eytt'
      default:
        return 'Breytt'
    }
  }
  
  // Custom Icelandic time formatting function
  const formatTimeInIcelandic = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    // Calculate time units
    const seconds = diffInSeconds
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    // In Icelandic, numbers ending in 1 (except 11) use singular form
    const usesSingular = (num: number): boolean => {
      return num % 10 === 1 && num % 100 !== 11
    }
    
    // Format with correct Icelandic grammar
    if (years > 0) {
      return usesSingular(years) ? `${years} ári` : `${years} árum`
    } else if (months > 0) {
      return usesSingular(months) ? `${months} mánuði` : `${months} mánuðum`
    } else if (days > 0) {
      if (days === 7) return '1 viku'
      if (days === 14) return '2 vikum'
      if (days === 21) return '3 vikum'
      if (days === 28) return '4 vikum'
      return usesSingular(days) ? `${days} degi` : `${days} dögum`
    } else if (hours > 0) {
      return usesSingular(hours) ? `${hours} klukkutíma` : `${hours} klukkutímum`
    } else if (minutes > 0) {
      return usesSingular(minutes) ? `${minutes} mínútu` : `${minutes} mínútum`
    } else {
      return usesSingular(seconds) ? `${seconds} sekúndu` : `${seconds} sekúndum`
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
        <h1 className="text-3xl md:text-4xl font-semibold">
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
                {formatOperation(building.lastEdit.operation)} fyrir {formatTimeInIcelandic(new Date(building.lastEdit.timestamp))} síðan
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 