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
import { useLocale } from "@/lib/i18n";

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
  const { t } = useLocale();
  const currentSvgOptions = svgOptions ?? {
    preserveMetadata: true,
    aggressive: false,
  };
  return (
    <div className="space-y-6">
      <Tabs defaultValue="balanced">
        <TabsList className="w-full">
          <TabsTrigger value="small">{t("smallest")}</TabsTrigger>
          <TabsTrigger value="balanced">{t("balanced")}</TabsTrigger>
          <TabsTrigger value="quality">{t("quality")}</TabsTrigger>
        </TabsList>
        <TabsContent
          value="small"
          className="pt-4 text-sm text-muted-foreground"
        >
          {t("smallestDescription")}
        </TabsContent>
        <TabsContent
          value="balanced"
          className="pt-4 text-sm text-muted-foreground"
        >
          {t("balancedDescription")}
        </TabsContent>
        <TabsContent
          value="quality"
          className="pt-4 text-sm text-muted-foreground"
        >
          {t("qualityDescription")}
        </TabsContent>
      </Tabs>
      <Accordion defaultValue={[]}>
        <AccordionItem value="advanced">
          <AccordionTrigger>{t("advancedSettings")}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{t("quality")}</span>
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
                  aria-label={t("compressionQuality")}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="dimension-scale"
                  className="text-sm font-medium"
                >
                  {t("dimensionScaling")}
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
          <h3 className="text-sm font-medium">{t("svgCompression")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("svgDescription")}
          </p>
        </div>
        <label
          htmlFor="preserve-svg-metadata"
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span>{t("preserveMetadata")}</span>
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
          <span>{t("aggressiveOptimization")}</span>
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
