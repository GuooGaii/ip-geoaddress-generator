import { signal } from "@preact/signals-react";

export const detectedIpSignal = signal<string>("");
export const queryIpSignal = signal<string>("");
export const ipLoadingSignal = signal<boolean>(false);
export const ipErrorSignal = signal<Error | null>(null);
