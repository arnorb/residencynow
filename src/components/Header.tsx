import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import logoSvg from "@/assets/habitera-logo.svg"

export function Header() {
  const { logout, user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`w-full border-b border-[#DADADA] fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-200 ${
      isScrolled ? 'py-1 md:py-2' : 'py-2 md:py-4'
    }`}>
      <div className="w-full flex justify-between items-center pl-4 pr-2 md:pl-8 md:pr-6">
        <div className="flex items-center gap-2">
          <img 
            src={logoSvg} 
            alt="Habitera" 
            className="h-4"
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