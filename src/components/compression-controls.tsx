import { Settings2 } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CompressionControlsProps = {
  quality: number[]
  onQualityChange: (value: number[]) => void
}

export function CompressionControls({ quality, onQualityChange }: CompressionControlsProps) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-2xl shadow-black/10"><CardHeader className="border-b border-border/60"><div className="flex items-center justify-between"><div><CardTitle className="flex items-center gap-2"><Settings2 className="size-4 text-sky-300" />Compression controls</CardTitle><CardDescription className="mt-1">Adjust quality before adding images.</CardDescription></div><Badge variant="secondary">Worker ready</Badge></div></CardHeader><CardContent className="space-y-6 pt-6"><Tabs defaultValue="balanced"><TabsList className="w-full"><TabsTrigger value="small">Smallest</TabsTrigger><TabsTrigger value="balanced">Balanced</TabsTrigger><TabsTrigger value="quality">Quality</TabsTrigger></TabsList><TabsContent value="small" className="pt-4 text-sm text-muted-foreground">Prioritize a smaller output size.</TabsContent><TabsContent value="balanced" className="pt-4 text-sm text-muted-foreground">A practical balance for everyday sharing.</TabsContent><TabsContent value="quality" className="pt-4 text-sm text-muted-foreground">Preserve more detail in the output.</TabsContent></Tabs><div className="space-y-3"><div className="flex justify-between text-sm"><span className="font-medium">Quality</span><span className="text-muted-foreground">{quality[0]}%</span></div><Slider value={quality} onValueChange={(value) => onQualityChange(value as number[])} aria-label="Compression quality" /></div><Accordion defaultValue={[]}><AccordionItem value="advanced"><AccordionTrigger>Advanced settings</AccordionTrigger><AccordionContent><p className="text-muted-foreground">Resize and format controls can be added to the worker protocol here.</p></AccordionContent></AccordionItem></Accordion></CardContent></Card>
  )
}
