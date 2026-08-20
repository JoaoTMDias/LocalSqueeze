import { useEffect, useState } from "react"
import { Download } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function ShrinkingCubeLogo() {
  return (
    <svg viewBox="0 0 512 512" className="size-9" role="img" aria-label="LocalSqueeze logo">
      <defs>
        <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" /><stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" /></linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38BDF8" /><stop offset="100%" stopColor="#6366F1" /></linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="#0F172A" />
      <g stroke="url(#outerGrad)" strokeWidth="4" fill="none" strokeLinejoin="round" strokeDasharray="8 8"><polygon points="256,72 384,136 256,200 128,136" /><polygon points="128,136 256,200 256,328 128,264" /><polygon points="256,200 384,136 384,264 256,328" /></g>
      <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.8"><line x1="200" y1="112" x2="232" y2="128" /><line x1="312" y1="112" x2="280" y2="128" /><line x1="168" y1="216" x2="192" y2="228" /><line x1="344" y1="216" x2="320" y2="228" /></g>
      <g fill="url(#innerGrad)" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round"><polygon points="256,176 320,208 256,240 192,208" opacity="0.95" /><polygon points="192,208 256,240 256,304 192,272" opacity="0.8" /><polygon points="256,240 320,208 320,272 256,304" /></g>
      <circle cx="256" cy="240" r="4" fill="#F8FAFC" />
    </svg>
  )
}

export function AppHeader() {
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
      <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10"><ShrinkingCubeLogo /></div><div><h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">LocalSqueeze</h1><p className="text-sm text-muted-foreground">Make files lighter. Keep them yours.</p></div></div>
      <div className="flex items-center gap-2">
        {installPrompt && <Button variant="outline" size="sm" onClick={installApp}><Download />Install App</Button>}
        <Badge variant="outline" className="gap-1.5 border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" />Client-side only</Badge>
      </div>
    </header>
  )
}
