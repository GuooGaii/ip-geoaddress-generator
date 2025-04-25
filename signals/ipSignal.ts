import { signal } from "@preact/signals-react";

export const ipSignal = signal<string>("");
export const ipLoadingSignal = signal<boolean>(false);
export const ipErrorSignal = signal<Error | null>(null);
