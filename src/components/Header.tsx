import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, UserCircle } from "lucide-react"

export function Header() {
  const { logout, user } = useAuth()

  return (
    <header className="w-full border-b border-[#DADADA]">
      <div className="w-full flex justify-between items-center p-5">
        <div className="flex items-center gap-2">
          <img 
            src="/habitera-logo.svg" 
            alt="Habitera" 
            className="h-6"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-[#605B5B] hover:text-black"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden md:inline text-sm font-normal">{user?.email}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={logout}>
              Útskrá
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 