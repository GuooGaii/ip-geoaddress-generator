import { signal } from "@preact/signals-react";
import type { IPQualityResult } from "@/app/types/ipQuality";

export const qualitySignal = signal<IPQualityResult | null>(null);