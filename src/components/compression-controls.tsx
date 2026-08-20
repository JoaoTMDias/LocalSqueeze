import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SvgCompressionOptions } from "@/lib/compression";

type CompressionControlsProps = {
  quality: number;
  scale: number;
  svgOptions?: SvgCompressionOptions;
  onQualityChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onSvgOptionsChange?: (value: SvgCompressionOptions) => void;
};

export function CompressionControls({
  quality,
  scale,
  svgOptions,
  onQualityChange,
  onScaleChange,
  onSvgOptionsChange,
}: CompressionControlsProps) {
  const currentSvgOptions = svgOptions ?? {
    preserveMetadata: true,
    aggressive: false,
  };
  return (
    <div className="space-y-6">
      <Tabs defaultValue="balanced">
        <TabsList className="w-full">
          <TabsTrigger value="small">Smallest</TabsTrigger>
          <TabsTrigger value="balanced">Balanced</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>
        <TabsContent
          value="small"
          className="pt-4 text-sm text-muted-foreground"
        >
          Prioritize a smaller output size.
        </TabsContent>
        <TabsContent
          value="balanced"
          className="pt-4 text-sm text-muted-foreground"
        >
          A practical balance for everyday sharing.
        </TabsContent>
        <TabsContent
          value="quality"
          className="pt-4 text-sm text-muted-foreground"
        >
          Preserve more detail in the output.
        </TabsContent>
      </Tabs>
      <Accordion defaultValue={[]}>
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Quality</span>
                  <span className="text-muted-foreground">{quality}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[quality]}
                  onValueChange={(value) =>
                    onQualityChange(
                      typeof value === "number"
                        ? value
                        : Number(value[0] ?? 80),
                    )
                  }
                  aria-label="Compression quality"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="dimension-scale"
                  className="text-sm font-medium"
                >
                  Dimension scaling
                </label>
                <Select
                  value={String(scale)}
                  onValueChange={(value: string | null) =>
                    onScaleChange(Number(value ?? 100))
                  }
                >
                  <SelectTrigger id="dimension-scale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="space-y-4 border-t border-border/60 pt-4">
        <div>
          <h3 className="text-sm font-medium">SVG compression</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            These options apply when compressing SVG files.
          </p>
        </div>
        <label
          htmlFor="preserve-svg-metadata"
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span>Preserve metadata and accessibility</span>
          <Switch
            id="preserve-svg-metadata"
            checked={currentSvgOptions.preserveMetadata}
            onCheckedChange={(checked) =>
              onSvgOptionsChange?.({
                ...currentSvgOptions,
                preserveMetadata: checked,
              })
            }
          />
        </label>
        <label
          htmlFor="aggressive-svg-optimization"
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span>Aggressive optimization</span>
          <Switch
            id="aggressive-svg-optimization"
            checked={currentSvgOptions.aggressive}
            onCheckedChange={(checked) =>
              onSvgOptionsChange?.({
                ...currentSvgOptions,
                aggressive: checked,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
