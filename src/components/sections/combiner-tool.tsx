"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  ImagePlus,
  Wand2,
  Loader2,
  Download,
  RefreshCw,
  Check,
  ChevronDown,
  Layers,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PRESETS } from "@/lib/content";

type ImageItem = {
  id: string;
  name: string;
  url: string; // data URL
  size: number;
};

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PRESET_IDS = PRESETS.map((p) => p.id);

export function CombinerTool() {
  const t = useTranslations("Combiner");
  const tRatios = useTranslations("Ratios");
  const tExamples = useTranslations("Examples");
  const tPresets = useTranslations("Presets");

  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid: File[] = [];
      for (const f of arr) {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          toast.error(t("errorFormat", { name: f.name }));
          continue;
        }
        if (f.size > MAX_FILE_SIZE) {
          toast.error(t("errorSize", { name: f.name }));
          continue;
        }
        valid.push(f);
      }
      if (valid.length === 0) return;

      const slotsLeft = MAX_IMAGES - images.length;
      if (slotsLeft <= 0) {
        toast.error(t("errorMax"));
        return;
      }
      const toAdd = valid.slice(0, slotsLeft);
      const overflow = valid.length - toAdd.length;
      if (overflow > 0) {
        toast.message(t("errorOverflow", { count: overflow }));
      }

      Promise.all(
        toAdd.map(
          (file) =>
            new Promise<ImageItem>((resolve) => {
              // Convert to PNG via canvas for better preservation
              const reader = new FileReader();
              reader.onload = () => {
                const img = new window.Image();
                img.onload = () => {
                  // Downscale large images to max 1024px (API limit)
                  const maxDim = 1024;
                  let { width, height } = img;
                  if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                  }
                  const canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) {
                    // Fallback to original
                    resolve({
                      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                      name: file.name,
                      url: reader.result as string,
                      size: file.size,
                    });
                    return;
                  }
                  ctx.drawImage(img, 0, 0, width, height);
                  // PNG preserves transparency and is lossless — better for the edit API
                  const pngDataUrl = canvas.toDataURL("image/png");
                  resolve({
                    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    name: file.name,
                    url: pngDataUrl,
                    size: file.size,
                  });
                };
                img.onerror = () => {
                  // Fallback to original if canvas fails
                  resolve({
                    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    name: file.name,
                    url: reader.result as string,
                    size: file.size,
                  });
                };
                img.src = reader.result as string;
              };
              reader.onerror = () => {
                resolve({
                  id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  name: file.name,
                  url: "",
                  size: file.size,
                });
              };
              reader.readAsDataURL(file);
            })
        )
      ).then((items) => {
        setImages((prev) => [...prev, ...items]);
      });
    },
    [images.length, t]
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const pickPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const promptText = tPresets(`items.${presetId}.prompt`);
    setPrompt(promptText);
    setShowPresets(false);
    const name = tPresets(`items.${presetId}.title`);
    toast.success(t("step2Applied", { name }));
  };

  const applyExample = (idx: number) => {
    const example = tExamples.raw(String(idx + 1)) as string;
    setPrompt(example);
  };

  const handleMerge = async () => {
    if (images.length < 2) {
      toast.error(t("errorMinImages"));
      return;
    }
    if (!prompt.trim()) {
      toast.error(t("errorNoPrompt"));
      return;
    }
    setIsMerging(true);
    setResult(null);
    try {
      const res = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          images: images.map((i) => i.url),
          size: ratio,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("errorGeneric"));
      }
      setResult(data.image);
      toast.success(t("success"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("errorGeneric");
      toast.error(msg);
    } finally {
      setIsMerging(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `fusionia-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setResult(null);
  };

  const canMerge = images.length >= 2 && prompt.trim().length > 0 && !isMerging;

  const RATIOS = ["auto", "1:1", "4:3", "3:4", "16:9", "9:16"];

  return (
    <section
      id="combiner"
      className="relative scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-primary mb-4">
            <Layers className="size-3.5" />
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.05] tracking-tight text-balance">
            {t("sectionTitle")}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground text-pretty">
            {t("sectionSubtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* LEFT: Configuration */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 dot-overlay opacity-30 pointer-events-none" />
            <div className="relative space-y-6">
              {/* Step 1: Images */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-medium flex items-center gap-2">
                    <span className="num-badge inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold">
                      1
                    </span>
                    {t("step1Title")}
                  </h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {images.length}/{MAX_IMAGES}
                  </span>
                </div>

                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`relative rounded-2xl border border-dashed transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-primary/[0.03]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-6 py-8 sm:py-10 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Upload className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium">
                          {t("step1Hint")}{" "}
                          <span className="text-primary link-underline">
                            {t("step1Browse")}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("step1Formats")}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Thumbnails */}
                {images.length > 0 && (
                  <ul className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <AnimatePresence initial={false}>
                      {images.map((img, idx) => (
                        <motion.li
                          key={img.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-card"
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="size-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 num-badge text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                              {t("step1Label")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1.5 right-1.5 size-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                            aria-label={`Retirer ${img.name}`}
                          >
                            <X className="size-3.5" />
                          </button>
                          <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/95 to-transparent text-[10px] text-foreground/80 px-2 py-1 truncate">
                            {img.name}
                          </span>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                    {images.length < MAX_IMAGES && (
                      <li>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="size-full aspect-square rounded-xl border border-dashed border-border hover:border-primary/60 hover:bg-primary/[0.04] transition-all flex items-center justify-center text-muted-foreground hover:text-primary"
                          aria-label="Ajouter une image"
                        >
                          <ImagePlus className="size-5" />
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Step 2: Preset */}
              <div>
                <h3 className="font-display text-lg font-medium flex items-center gap-2 mb-3">
                  <span className="num-badge inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold">
                    2
                  </span>
                  {t("step2Title")}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("step2Hint")}
                </p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPresets((v) => !v)}
                    className="w-full flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3 text-sm hover:border-primary/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {selectedPreset ? (
                        <>
                          <Check className="size-4 text-primary" />
                          <span className="font-medium">
                            {tPresets(`items.${selectedPreset}.title`)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("step2NoPreset")}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        showPresets ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {showPresets && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-20 top-full mt-2 left-0 right-0 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-2xl backdrop-blur-xl p-1.5 space-y-1"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPreset(null);
                              setShowPresets(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent/10 transition-colors text-muted-foreground"
                          >
                            {t("step2NoPreset")}
                          </button>
                        </li>
                        {PRESET_IDS.map((pid) => (
                          <li key={pid}>
                            <button
                              type="button"
                              onClick={() => pickPreset(pid)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">
                                  {tPresets(`items.${pid}.title`)}
                                </span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  {tPresets(`items.${pid}.category`)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {tPresets(`items.${pid}.description`)}
                              </p>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Step 3: Prompt */}
              <div>
                <h3 className="font-display text-lg font-medium flex items-center gap-2 mb-3">
                  <span className="num-badge inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold">
                    3
                  </span>
                  {t("step3Title")}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {t("step3Hint")}
                </p>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t("step3Placeholder")}
                  maxLength={1500}
                  className="min-h-[120px] resize-y bg-card/60"
                />
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Lightbulb className="size-3.5" />
                      {t("step3TryLabel")}
                    </span>
                    {[1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyExample(idx - 1)}
                        className="text-xs px-2 py-1 rounded-md border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {t("step3Example", { n: idx })}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {prompt.length}/1500
                  </span>
                </div>
              </div>

              {/* Output ratio */}
              <div>
                <h3 className="font-display text-base font-medium mb-2">
                  {t("ratioTitle")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {RATIOS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRatio(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        ratio === r
                          ? "num-badge"
                          : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {tRatios(r as "auto" | "1:1")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Merge button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleMerge}
                  disabled={!canMerge}
                  size="lg"
                  className="w-full h-12 rounded-xl text-base font-medium glow-amber-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("merging")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4" />
                      {t("mergeButton")}
                    </>
                  )}
                </Button>
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  {images.length < 2 ? t("mergeHintMin") : t("mergeHintReady")}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Result */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden min-h-[480px]">
            <div className="absolute inset-0 aurora-bg-subtle pointer-events-none" />
            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-medium flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  {t("resultTitle")}
                </h3>
                {result && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={reset}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="size-3.5" />
                      {t("resultRedo")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={downloadResult}
                      className="glow-amber-sm"
                    >
                      <Download className="size-3.5" />
                      {t("resultDownload")}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center rounded-2xl border border-border bg-background/40 p-4 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {isMerging && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="relative mx-auto size-20">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Wand2 className="size-7 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{t("merging")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("resultLoadingHint")}
                        </p>
                      </div>
                      <div className="space-y-1.5 w-48 mx-auto">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              delay: (i - 1) * 0.8,
                              duration: 0.4,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                            className="text-[10px] text-muted-foreground flex items-center gap-1.5"
                          >
                            <span className="size-1 rounded-full bg-primary" />
                            {t(`resultLoading${i}`)}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {result && !isMerging && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="w-full"
                    >
                      <div className="relative rounded-xl overflow-hidden border border-border glow-amber">
                        <img
                          src={result}
                          alt="Image fusionnée"
                          className="w-full h-auto block"
                        />
                        <div className="absolute top-2 right-2 inline-flex items-center gap-1 num-badge text-[10px] font-semibold px-2 py-1 rounded-md">
                          <Check className="size-3" />
                          {t("resultDone")}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground text-center">
                        {t("resultDownloadHint")}
                      </p>
                    </motion.div>
                  )}
                  {!result && !isMerging && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center max-w-sm space-y-3"
                    >
                      <div className="mx-auto size-16 rounded-2xl border border-dashed border-border flex items-center justify-center text-muted-foreground/60">
                        <ImagePlus className="size-7" />
                      </div>
                      <p className="text-sm font-medium">
                        {t("resultEmptyTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("resultEmptyBody")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="size-3.5 mt-0.5 shrink-0 text-primary/70" />
                <p>{t("resultPrivacy")}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
