"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { Badge } from "@/components/ui/badge"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">MediAssistAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant={pathname === "/patient" ? "secondary" : "ghost"} asChild>
              <Link href="/patient">Patient Demo</Link>
            </Button>
            <Button variant={pathname === "/doctor" ? "secondary" : "ghost"} asChild>
              <Link href="/doctor">
                Doctor Dashboard
                {pathname === "/doctor" && (
                  <Badge variant="outline" className="ml-2">
                    Portal
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <Button variant="outline" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
