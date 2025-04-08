import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { Home, Map, Info, Mail } from "lucide-react"

export function Header() {
  return (
    <header className="bg-[#4A67C0] dark:bg-[#3A57B0] text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          WanderGuide
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="flex items-center hover:text-gray-200">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/locations" className="flex items-center hover:text-gray-200">
                <Map className="w-4 h-4 mr-1" />
                Locations
              </Link>
            </li>
            <li>
              <Link href="/about" className="flex items-center hover:text-gray-200">
                <Info className="w-4 h-4 mr-1" />
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="flex items-center hover:text-gray-200">
                <Mail className="w-4 h-4 mr-1" />
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="secondary"
            className="bg-[#6A87E0] hover:bg-[#8AA7FF] text-white dark:bg-[#5A77D0] dark:hover:bg-[#7A97F0] dark:text-white"
          >
            Sign in
          </Button>
          <Button className="bg-white hover:bg-[#E6F0FF] text-[#4A67C0] hover:text-[#4A67C0] dark:bg-white dark:text-[#3A57B0]">
            Register
          </Button>
        </div>
      </div>
    </header>
  )
}
