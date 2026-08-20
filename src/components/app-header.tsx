import { useEffect, useState } from "react"
import { Download, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CompressionControls } from "@/components/compression-controls"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type AppHeaderProps = {
  quality: number
  scale: number
  onQualityChange: (value: number) => void
  onScaleChange: (value: number) => void
}

export function AppHeader({ quality, scale, onQualityChange, onScaleChange }: AppHeaderProps) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    if (isStandalone) return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleAppInstalled = () => setInstallPrompt(null)

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") setInstallPrompt(null)
  }

  return (
    <header className="flex items-center justify-between border-b border-border/70 pb-3">
      <div className="flex items-center gap-3"><div className="grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10"><img src="/logo.svg" className="size-9" alt="" /></div><div><h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">LocalSqueeze</h1><p className="text-sm text-muted-foreground">Make files lighter. Keep them yours.</p></div></div>
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm"><Settings />Settings</Button>} />
          <SheetContent side="right" className="max-sm:inset-x-0 max-sm:inset-y-auto max-sm:right-auto max-sm:bottom-0 max-sm:h-auto max-sm:w-full max-sm:max-w-none max-sm:border-l-0 max-sm:border-t max-sm:data-ending-style:translate-x-0 max-sm:data-starting-style:translate-x-0 max-sm:data-ending-style:translate-y-[2.5rem] max-sm:data-starting-style:translate-y-[2.5rem]">
            <SheetHeader>
              <SheetTitle>Compression controls</SheetTitle>
              <SheetDescription>Balanced defaults are ready to go.</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-6 pb-6"><CompressionControls quality={quality} scale={scale} onQualityChange={onQualityChange} onScaleChange={onScaleChange} /></div>
          </SheetContent>
        </Sheet>
        {installPrompt && <Button variant="outline" size="sm" onClick={installApp}><Download />Install App</Button>}
      </div>
    </header>
  )
}
