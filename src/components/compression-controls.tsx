import { Settings2 } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CompressionControlsProps = {
  quality: number
  scale: number
  onQualityChange: (value: number) => void
  onScaleChange: (value: number) => void
}

export function CompressionControls({ quality, scale, onQualityChange, onScaleChange }: CompressionControlsProps) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-2xl shadow-black/10"><CardHeader className="border-b border-border/60"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Settings2 className="size-4 text-sky-300" />Compression controls</CardTitle><CardDescription className="mt-1">Balanced defaults are ready to go.</CardDescription></div><Badge variant="secondary">Worker ready</Badge></div></CardHeader><CardContent className="space-y-6 pt-6"><Tabs defaultValue="balanced"><TabsList className="w-full"><TabsTrigger value="small">Smallest</TabsTrigger><TabsTrigger value="balanced">Balanced</TabsTrigger><TabsTrigger value="quality">Quality</TabsTrigger></TabsList><TabsContent value="small" className="pt-4 text-sm text-muted-foreground">Prioritize a smaller output size.</TabsContent><TabsContent value="balanced" className="pt-4 text-sm text-muted-foreground">A practical balance for everyday sharing.</TabsContent><TabsContent value="quality" className="pt-4 text-sm text-muted-foreground">Preserve more detail in the output.</TabsContent></Tabs><Accordion defaultValue={[]}><AccordionItem value="advanced"><AccordionTrigger>Advanced settings</AccordionTrigger><AccordionContent><div className="space-y-6"><div className="space-y-3"><div className="flex justify-between text-sm"><span className="font-medium">Quality</span><span className="text-muted-foreground">{quality}%</span></div><Slider min={0} max={100} step={1} value={[quality]} onValueChange={(value) => onQualityChange(typeof value === "number" ? value : Number(value[0] ?? 80))} aria-label="Compression quality" /></div><div className="space-y-2"><label htmlFor="dimension-scale" className="text-sm font-medium">Dimension scaling</label><Select value={String(scale)} onValueChange={(value: string | null) => onScaleChange(Number(value ?? 100))}><SelectTrigger id="dimension-scale" aria-label="Dimension scaling"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="100">100%</SelectItem><SelectItem value="75">75%</SelectItem><SelectItem value="50">50%</SelectItem></SelectContent></Select></div></div></AccordionContent></AccordionItem></Accordion></CardContent></Card>
  )
}
