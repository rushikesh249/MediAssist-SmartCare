"use client"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

export function FloatingMicButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover-lift transition-all duration-300 z-50 animate-fade-in"
            asChild
            aria-label="Quick access to voice recording - Voice-first mode enabled"
          >
            <Link href="/patient">
              <Mic className="h-6 w-6" />
              <span className="sr-only">Voice-first mode enabled</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Voice-first mode enabled</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
