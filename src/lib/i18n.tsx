import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const locales = ["en", "pt-PT"] as const;
export type Locale = (typeof locales)[number];

type TranslationValues = Record<string, string | number>;
type Translation = string | ((values: TranslationValues) => string);

type Messages = Record<string, Translation>;

const messages: Record<Locale, Messages> = {
  en: {
    ready: "Ready to add files.",
    compressionProgress: ({ progress }) =>
      `Compression progress: ${progress}%.`,
    compressionFailed: "A file failed to compress.",
    compressionComplete: "Compression complete and ready to download.",
    workerError: "The image worker encountered an error.",
    fileAdded: ({ name }) => `${name} added and processing started.`,
    unsupportedFiles: ({ count }) =>
      `${count} unsupported file${count === 1 ? "" : "s"} rejected. Add JPEG, PNG, SVG, WebP, PDF, or MP4 files.`,
    fileReadError: "Could not read this file.",
    fileRemoved: "File removed from the queue.",
    queueCleared: "Queue cleared.",
    skipMain: "Skip to main content",
    skipControls: "Skip to compression controls",
    footerPrivacy: "No uploads. No accounts. No compromises.",
    footerOpen: "Free, Open and Local by design",
    compressionControls: "Compression controls",
    compressionDefaults: "Balanced defaults are ready to go.",
    installApp: "Install App",
    updateAvailable: "New version available",
    updateDescription: "Update to load the latest changes.",
    update: "Update",
    filePicker: "File picker",
    releaseToCompress: "Release to compress",
    dropFiles: "Drop files here",
    supportedTypes: "Images, SVGs, PDFs, and MP4 video are supported",
    browseFiles: "Browse files",
    processedLocally: "Processed locally in your browser",
    smallest: "Smallest",
    balanced: "Balanced",
    quality: "Quality",
    smallestDescription: "Prioritize a smaller output size.",
    balancedDescription: "A practical balance for everyday sharing.",
    qualityDescription: "Preserve more detail in the output.",
    advancedSettings: "Advanced settings",
    compressionQuality: "Compression quality",
    dimensionScaling: "Dimension scaling",
    svgCompression: "SVG compression",
    svgDescription: "These options apply when compressing SVG files.",
    preserveMetadata: "Preserve metadata and accessibility",
    aggressiveOptimization: "Aggressive optimization",
    queueFiles: ({ count }) =>
      `${count} file${count === 1 ? "" : "s"} in the queue.`,
    yourQueue: "Your queue",
    compressionResults: "Compression results",
    files: ({ count }) => `${count} file${count === 1 ? "" : "s"}`,
    clearAll: "Clear all",
    original: ({ size }) => `Original: ${size}`,
    complete: "Complete",
    compressing: "Compressing",
    error: "Error",
    download: ({ name }) => `Download ${name}`,
    downloadFile: "Download file",
    remove: ({ name }) => `Remove ${name}`,
    removeFile: "Remove file",
    close: "Close",
    language: "Language",
    languageEnglish: "English",
    languagePortuguese: "Português (Portugal)",
  },
  "pt-PT": {
    ready: "Pronto para adicionar ficheiros.",
    compressionProgress: ({ progress }) =>
      `Progresso da compressão: ${progress}%.`,
    compressionFailed: "Um ficheiro não foi comprimido.",
    compressionComplete: "Compressão concluída e pronta para descarregar.",
    workerError: "O processador de imagens encontrou um erro.",
    fileAdded: ({ name }) => `${name} adicionado e processamento iniciado.`,
    unsupportedFiles: ({ count }) =>
      `${count} ${count === 1 ? "ficheiro não suportado rejeitado" : "ficheiros não suportados rejeitados"}. Adicione ficheiros JPEG, PNG, SVG, WebP, PDF ou MP4.`,
    fileReadError: "Não foi possível ler este ficheiro.",
    fileRemoved: "Ficheiro removido da fila.",
    queueCleared: "Fila limpa.",
    skipMain: "Saltar para o conteúdo principal",
    skipControls: "Saltar para os controlos de compressão",
    footerPrivacy: "Sem uploads. Sem contas. Sem compromissos.",
    footerOpen: "Livre, aberto e local por definição",
    compressionControls: "Controlos de compressão",
    compressionDefaults: "As predefinições equilibradas estão prontas.",
    installApp: "Instalar aplicação",
    updateAvailable: "Nova versão disponível",
    updateDescription: "Atualize para carregar as alterações mais recentes.",
    update: "Atualizar",
    filePicker: "Seletor de ficheiros",
    releaseToCompress: "Solte para comprimir",
    dropFiles: "Coloque os ficheiros aqui",
    supportedTypes: "São suportadas imagens, SVG, PDF e vídeo MP4",
    browseFiles: "Procurar ficheiros",
    processedLocally: "Processado localmente no seu navegador",
    smallest: "Mais pequeno",
    balanced: "Equilibrado",
    quality: "Qualidade",
    smallestDescription: "Dê prioridade a um ficheiro de saída mais pequeno.",
    balancedDescription: "Um equilíbrio prático para partilhar no dia a dia.",
    qualityDescription: "Preserve mais detalhes no ficheiro de saída.",
    advancedSettings: "Definições avançadas",
    compressionQuality: "Qualidade da compressão",
    dimensionScaling: "Escala das dimensões",
    svgCompression: "Compressão SVG",
    svgDescription: "Estas opções aplicam-se ao comprimir ficheiros SVG.",
    preserveMetadata: "Preservar metadados e acessibilidade",
    aggressiveOptimization: "Otimização agressiva",
    queueFiles: ({ count }) =>
      `${count} ${count === 1 ? "ficheiro na fila" : "ficheiros na fila"}.`,
    yourQueue: "A sua fila",
    compressionResults: "Resultados da compressão",
    files: ({ count }) => `${count} ${count === 1 ? "ficheiro" : "ficheiros"}`,
    clearAll: "Limpar tudo",
    original: ({ size }) => `Original: ${size}`,
    complete: "Concluído",
    compressing: "A comprimir",
    error: "Erro",
    download: ({ name }) => `Descarregar ${name}`,
    downloadFile: "Descarregar ficheiro",
    remove: ({ name }) => `Remover ${name}`,
    removeFile: "Remover ficheiro",
    close: "Fechar",
    language: "Idioma",
    languageEnglish: "English",
    languagePortuguese: "Português (Portugal)",
  },
};

const storageKey = "squeeezer-locale";

export function resolveLocale(value?: string | null): Locale {
  if (value?.toLowerCase().startsWith("pt")) return "pt-PT";
  if (value?.toLowerCase().startsWith("en")) return "en";
  return "en";
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return (
    navigator.languages
      .map(resolveLocale)
      .find((locale) => locale === "pt-PT") ?? resolveLocale(navigator.language)
  );
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const storedLocale = window.localStorage.getItem(storageKey);
  return storedLocale ? resolveLocale(storedLocale) : detectLocale();
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: TranslationValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(storageKey, nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, values: TranslationValues = {}) => {
      const translation = messages[locale][key] ?? messages.en[key] ?? key;
      return typeof translation === "function"
        ? translation(values)
        : translation;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

export function formatLocalizedNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "pt-PT" ? "pt-PT" : "en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}
